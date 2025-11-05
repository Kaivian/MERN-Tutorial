# Lesson 2 - Setup
Okay, giờ tới với bài 2 nè, thì tới với bài này, thì TLuc chỉ giới thiệu về **Next.js + React + Typescript** và trên **Windows** thôi nhen nó có nhiều loại lắm nhưng mà sau 7-8 cái dự án rồi thì mình thấy cái này là bộ ba này là ngon nhất, còn vì sao nó tốt thì các bạn có thể tự tìm hiểu nha!
<details>
<summary>Spoil câu hỏi để tìm hiểu</summary>

- Next.js là gì? So sánh giữa Next.js và những loại khác?
- Những điểm mạnh khi dùng Next.js
- Typescript là gì? So sánh với Javascript?
- Tôi chọn Next.js + React + Typescript thì có tốt không?
</details>
<details>
<summary>Spoiler câu trả lời</summary>
Bộ ba này mang lại sự cân bằng tốt nhất giữa hiệu năng, khả năng mở rộng và trải nghiệm lập trình.
</details>
Rồi không lòng vòng nữa chúng ta cùng đi setup một cái page nhỏ thôi!

## Step 1 - Cài đặt môi trường
Để có thể tạo một dự án thì trước hết bạn cần cài **Node.js** đã: [link tải](https://nodejs.org/en/download)  
Sau khi cài xong, mở **Visual Studio Code** hoặc **Command Prompt (CMD)**, nhập lệnh:
```
node -v
npm -v
```

để kiểm tra xem đã cài chưa nha, và nhớ là check phiên bản đã cài nha (*Nên dùng bản **Release** thay vì bản **mới nhất***) và bản **Node.js** mới nhất tính tới *03/11/2025* là `v25.1.0` và **npm** là `11.5.1`.

> Còn vì sao lại là **npm** mà không phải **Yarn** hay **pnpm** thì các bạn có thể tìm hiểu thêm và mình sẽ bỏ nó vào một bài giải đáp thắc mắc riêng nha. Ở đây mình chọn **npm** vì tính phổ biến và dễ quản lý.

## Step 2 - Tạo project
Và ở đây chúng ta có 2 cách:

 1. Clone repo về: thì mình có để sẵn **src** của **Lesson 2** [ở đây](https://github.com/Kaivian/MERN-Tutorial/tree/main/MERN/src/Lesson%202) thì các bạn có thể clone về và chạy **npm install** ở terminal là xong.
 2. Manual: cái này hơi rườm rà một tí vì phải cài thủ công tất tần tật mọi thứ luôn\

### Cách 2 - Manual (Tạo project thủ công)

1. Mở termial trong VS Code lên và nhập lệnh `npx create-next-app@latest my-next-app --typescript`, ở đây `my-next-app` chính là thư mục chưa code của project.
2. Trả lời các câu hỏi khi khởi tạo:
- `Which linter would you like to use?` → **ESLint**
-   `Would you like to use React Compiler?` → **Yes**
-   `Would you like to use Tailwind CSS?` → **Yes**
-   `Would you like your code inside a src/ directory?` → **Yes**
-   `Would you like to use App Router?` → **Yes**
-   `Would you like to use Turbopack?` → **Yes**
-   `Would you like to customize the import alias ("@/*" by default)?` → **Yes**
-   `What import alias would you like configured?` → `"@/*"`
 3. Sau khi đã làm xong các bước trên thì bây giờ cơ bản chúng ta đã có một dự án basic và dùng `npm install` để cài đặt tất cả **module** cần để chạy và `npm run dev` là trang web sẽ được chạy ở **localhost** ở máy chúng ta và thường là port **3000**. Ex:
```
▲ Next.js 16.0.1 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.8:3000
```
Nếu bạn thấy trang chào mừng của Next.js, tức là setup đã thành công!

## Step 3 - Cài đặt thư viện
Để bổ sung các thư viện hỗ trợ, bạn có thể cài thêm các package cần thiết:
Ví dụ:

 - [bcrypt](https://www.npmjs.com/package/bcrypt) – mã hóa mật khẩu
 - [lucide](https://lucide.dev/) - bộ icon linh hoạt
 - [HeroUI](https://www.heroui.com/docs/guide/introduction) - UI framework giúp tạo giao diện nhanh và đẹp

Hầu hết các thư viện đều có hướng dẫn cài đặt cụ thể.
Ví dụ, bạn có thể xem phần [HeroUI Installation Guide](https://www.heroui.com/docs/guide/installation) để thực hiện từng bước, mình khuyến khích các bạn tự tìm hiểu về phần này nha!

> Nếu mà bí quá thì [qua đây](https://github.com/Kaivian/MERN-Tutorial/tree/main/MERN/src/Lesson%202) clone về cho nhanh, trong đó thì mình đã setup sẵn với **HeroUI** rồi đó.

## Tổng kết
Về cơ bản thì đây là những bước cần thiết để tạo ra một trang web dùng **Next.js + React + TypeScript** và các bạn có thể `npm run dev` để chạy trang web đó, còn về cấu trúc của một project hoàn chỉnh thì chúng ta sẽ có một bài khác nói chi tiết về việc này nha.