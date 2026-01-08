'use client'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-10">
      <h2>Đã có lỗi xảy ra!</h2>
      <button onClick={() => reset()}>Thử lại</button>
    </div>
  )
}