'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Hệ thống có lỗi</title>
      </head>
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'sans-serif'
      }}>
        <h2>Đã có lỗi nghiêm trọng xảy ra!</h2>
        <p style={{ color: 'gray' }}>{error?.message || "Vui lòng thử lại sau"}</p>
        <button
          onClick={() => reset()}
          style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px' }}
        >
          Thử lại
        </button>
      </body>
    </html>
  );
}