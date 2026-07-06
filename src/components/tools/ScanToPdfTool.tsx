import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Upload, X, Loader2, ArrowRight, Plus, Contrast, RotateCw, CheckCircle2 } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { Capacitor } from '@capacitor/core'

import { addActivity } from '../../utils/recentActivity'
import SuccessState from './shared/SuccessState'
import PrivacyBadge from './shared/PrivacyBadge'
import { NativeToolLayout } from './shared/NativeToolLayout'

type ScanPage = { id: string; file: File; preview: string; enhanced: boolean }

// ── Enhancement ──────────────────────────────────────────────────────────────
async function enhanceScanFromUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const contrast = 1.5
      const intercept = 128 * (1 - contrast)
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        const v = Math.min(255, Math.max(0, Math.round(gray * contrast + intercept)))
        data[i] = v; data[i + 1] = v; data[i + 2] = v
      }
      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = reject
    img.src = src
  })
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// ── Camera Modal ──────────────────────────────────────────────────────────────
function CameraModal({ onCapture, onClose, onUpload }: {
  onCapture: (dataUrl: string) => void
  onClose: () => void
  onUpload: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setReady(false)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); setReady(true) }
      }
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (e.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else {
        setError('Could not start camera. Make sure no other app is using it.')
      }
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facingMode, startCamera])

  const handleCapture = () => {
    if (!videoRef.current || !ready) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    onCapture(canvas.toDataURL('image/jpeg', 0.95))
  }

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>
        <span className="text-white font-black text-sm uppercase tracking-widest">Camera</span>
        <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <RotateCw size={18} />
        </button>
      </div>
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="mx-6 bg-zinc-900 rounded-3xl p-8 text-center space-y-5 border border-white/10">
              {/* Icon */}
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                <Camera size={28} className="text-rose-400" />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-white font-black text-lg mb-1">Camera Blocked</h3>
                <p className="text-white/50 text-xs leading-relaxed">{error}</p>
              </div>

              {/* Fix instructions */}
              <div className="bg-white/5 rounded-2xl p-4 text-left space-y-2">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-3">How to allow camera</p>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p className="text-white/70 text-xs">Click the 🔒 lock icon in your browser address bar</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p className="text-white/70 text-xs">Set <strong className="text-white">Camera</strong> to <strong className="text-white">Allow</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p className="text-white/70 text-xs">Reload the page and tap Retry</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm transition-all active:scale-95"
                >
                  Retry
                </button>
                <button
                  onClick={() => { onClose(); onUpload() }}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Upload size={16} /> Upload Images Instead
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!ready && <div className="absolute inset-0 flex items-center justify-center bg-black"><Loader2 size={32} className="animate-spin text-white/50" /></div>}
            {ready && (
              <div className="absolute inset-8 pointer-events-none">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-rose-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-rose-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-rose-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-rose-400 rounded-br-xl" />
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center justify-center py-8">
        <button onClick={handleCapture} disabled={!ready || !!error} className="w-20 h-20 rounded-full bg-white disabled:opacity-30 active:scale-90 transition-all shadow-2xl flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-rose-500" />
        </button>
      </div>
    </div>
  )
}

// ── Page Thumbnail Card ───────────────────────────────────────────────────────
function PageCard({ page, index, onRemove, onToggleEnhance }: {
  page: ScanPage
  index: number
  onRemove: (id: string) => void
  onToggleEnhance: (id: string) => void
}) {
  return (
    <div className="relative group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
      {/* Thumbnail */}
      <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-black">
        <img src={page.preview} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
      </div>

      {/* Page number badge */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black rounded-full flex items-center justify-center">
        {index + 1}
      </div>

      {/* Enhanced badge */}
      {page.enhanced && (
        <div className="absolute top-2 right-8 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <CheckCircle2 size={8} /> HD
        </div>
      )}

      {/* Remove */}
      <button
        onClick={() => onRemove(page.id)}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
      >
        <X size={12} />
      </button>

      {/* Footer */}
      <div className="p-2 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 truncate">pg {index + 1}</span>
        <button
          onClick={() => onToggleEnhance(page.id)}
          title={page.enhanced ? 'Revert enhancement' : 'Enhance scan'}
          className={`p-1 rounded-lg transition-all ${page.enhanced ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/30' : 'text-gray-300 dark:text-zinc-600 hover:text-rose-400'}`}
        >
          <Contrast size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScanToPdfTool() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pages, setPages] = useState<ScanPage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [customFileName, setCustomFileName] = useState('paperknife-scan')
  const [showCamera, setShowCamera] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const pageIndexRef = useRef(0)
  const isNative = Capacitor.isNativePlatform()

  const addFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (valid.length === 0) { toast.error('Please select image files (JPG, PNG, WebP)'); return }
    setPages(prev => [...prev, ...valid.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      enhanced: false
    }))])
    setDownloadUrl(null)
  }

  const handleCameraCapture = (dataUrl: string) => {
    pageIndexRef.current += 1
    const bytes = dataUrlToBytes(dataUrl)
    const file = new File([new Blob([bytes as any], { type: 'image/jpeg' })], `scan-page-${pageIndexRef.current}.jpg`, { type: 'image/jpeg' })
    setPages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), file, preview: dataUrl, enhanced: false }])
    setDownloadUrl(null)
    setShowCamera(false)
    toast.success('Page captured!')
  }

  const handleToggleEnhance = async (id: string) => {
    const page = pages.find(p => p.id === id)
    if (!page) return
    if (page.enhanced) {
      setPages(prev => prev.map(p => p.id === id ? { ...p, preview: URL.createObjectURL(p.file), enhanced: false } : p))
    } else {
      try {
        const enhanced = await enhanceScanFromUrl(page.preview)
        setPages(prev => prev.map(p => p.id === id ? { ...p, preview: enhanced, enhanced: true } : p))
      } catch { toast.error('Enhancement failed') }
    }
  }

  const generatePdf = async () => {
    if (pages.length === 0) return
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 100))
    try {
      const pdfDoc = await PDFDocument.create()
      for (const page of pages) {
        const rawBytes = dataUrlToBytes(page.preview)
        const pdfImg = page.preview.startsWith('data:image/png')
          ? await pdfDoc.embedPng(rawBytes)
          : await pdfDoc.embedJpg(rawBytes)
        const A4_W = 595, A4_H = 842
        const ratio = Math.min(A4_W / pdfImg.width, A4_H / pdfImg.height)
        const w = pdfImg.width * ratio, h = pdfImg.height * ratio
        const pdfPage = pdfDoc.addPage([A4_W, A4_H])
        pdfPage.drawImage(pdfImg, { x: (A4_W - w) / 2, y: (A4_H - h) / 2, width: w, height: h })
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      addActivity({ name: `${customFileName}.pdf`, tool: 'Scan to PDF', size: blob.size, resultUrl: url })
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const ActionButton = () => (
    <button
      onClick={generatePdf}
      disabled={isProcessing || pages.length === 0}
      className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-rose-500/20 ${isNative ? 'py-4 rounded-2xl text-sm' : 'p-6 rounded-3xl text-xl'}`}
    >
      {isProcessing ? <><Loader2 className="animate-spin" /> Processing...</> : <>Generate PDF <ArrowRight size={18} /></>}
    </button>
  )

  return (
    <>
      {showCamera && <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} onUpload={() => fileInputRef.current?.click()} />}

      <NativeToolLayout
        title="Scan to PDF"
        description="Capture documents with your camera and convert them into a PDF."
        actions={pages.length > 0 && !downloadUrl && <ActionButton />}
      >
        <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={e => e.target.files && addFiles(e.target.files)} />

        {pages.length === 0 ? (
          /* ── Empty state with drag-and-drop (BUG-10 fix) ── */
          <div className="space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
              onDrop={e => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files && addFiles(e.dataTransfer.files) }}
              className={`border-4 border-dashed rounded-[2.5rem] p-10 text-center transition-all ${isDragging ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 scale-[1.01]' : 'border-gray-100 dark:border-zinc-900'}`}
            >
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Camera size={32} />
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">
                {isDragging ? 'Drop images here' : 'Scan a Document'}
              </h3>
              <p className="text-sm text-gray-400 mb-8">
                {isDragging ? 'Release to add pages' : 'Use your camera or upload existing images to build a scanned PDF'}
              </p>

              {/* Two prominent action buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex-1 max-w-[160px] flex items-center justify-center gap-2 px-4 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  <Camera size={17} /> Camera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 max-w-[160px] flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-2xl font-black text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  <Upload size={17} /> Upload
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-zinc-600">
              Drag & drop images · JPG · PNG · WebP
            </p>
          </div>
        ) : !downloadUrl ? (
          /* ── Pages state ── */
          <div className="space-y-6">
            {/* Count + clear */}
            <div className="flex justify-between items-center px-1">
              <p className="text-[10px] font-black uppercase text-gray-400">{pages.length} {pages.length === 1 ? 'Page' : 'Pages'}</p>
              <button onClick={() => setPages([])} className="text-[10px] font-black uppercase text-rose-500/60 hover:text-rose-500 transition-colors">Clear</button>
            </div>

            {/* Thumbnail grid – 2 cols on small screens, 3 on wider (BUG-13 fix) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pages.map((page, i) => (
                <PageCard
                  key={page.id}
                  page={page}
                  index={i}
                  onRemove={id => setPages(prev => prev.filter(p => p.id !== id))}
                  onToggleEnhance={handleToggleEnhance}
                />
              ))}

              {/* Add page tiles */}
              <button
                onClick={() => setShowCamera(true)}
                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-rose-400 hover:text-rose-500 transition-all"
              >
                <Camera size={20} />
                <span className="text-[10px] font-black uppercase">Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-rose-400 hover:text-rose-500 transition-all"
              >
                <Plus size={20} />
                <span className="text-[10px] font-black uppercase">Upload</span>
              </button>
            </div>

            {/* Enhance hint */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-zinc-600 text-center">
              Tap <Contrast size={10} className="inline" /> on a page to apply scan enhancement
            </p>

            {/* Filename */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Filename</label>
              <input
                type="text"
                value={customFileName}
                onChange={e => setCustomFileName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black rounded-xl px-4 py-3 border border-transparent focus:border-rose-500 outline-none font-bold text-sm dark:text-white"
              />
            </div>

            {!isNative && <ActionButton />}
          </div>
        ) : (
          <SuccessState
            message="Scan PDF Ready!"
            downloadUrl={downloadUrl}
            fileName={`${customFileName}.pdf`}
            onStartOver={() => { setDownloadUrl(null); setPages([]) }}
          />
        )}

        <PrivacyBadge />
      </NativeToolLayout>
    </>
  )
}
