# Lesson 2 - Setup
Okay, giờ tới với bài 2 nè, thì tới với bài này, thì TLuc chỉ giới thiệu về **Next.js + React + Typescript** và trên **Windows** thôi nhen nó có nhiều loại lắm nhưng mà sau 7-8 cái dự án rồi thì mình thấy cái này là ngon nhất, còn vì sao nó tốt thì các bạn có thể tự tìm hiểu nha!
<details>
<summary>Spoil câu hỏi để tìm hiểu</summary>

- Next.js là gì? So sánh giữa Next.js và những loại khác?
- Những điểm mạnh khi dùng Next.js
- Typescript là gì? So sánh với Javascript?
- Tôi chọn Next.js + React + Typescript thì có tốt không?
</details>

Rồi không lòng vòng nữa chúng ta cùng đi setup một cái page nhỏ thôi!

## Step 1 - Cài đặt môi trường
Để có thể tạo một dự án thì trước hết bạn cần cài **Node.js** đã: [link tải](https://nodejs.org/en/download)
Rồi vào **Visual Studio Code** bật terminal lên (bật ở **cmd**) cũng được, sau đó gõ:
```
node -v
npm -v
```

để kiểm tra xem đã cài chưa nha, và nhớ là check phiên bản đã cài nha (*Nên dùng bản **Release** thay vì bản **mới nhất***) và bản Node.js mới nhất tính tới *03/11/2025* là `v25.1.0` và **npm** là `11.5.1`.

> Còn vì sao lại là **npm** mà không phải **Yarn** hay **pnpm** thì các bạn có thể tìm hiểu thêm và mình sẽ bỏ nó vào một bài giải đáp thắc mắc riêng nha.

## Step 2 - Tạo project
Và ở đây chúng ta có 2 cách:

 1. Clone repo về: thì mình có để sẵn **src** của **Lesson 2** [ở đây](https://github.com/Kaivian/MERN-Tutorial/tree/main/MERN/src/Lesson%202) thì các bạn có thể clone về và chạy **npm install** ở terminal là xong.
 2. Manual: cái này hơi rườm rà một tí vì phải cài thủ công tất tần tật mọi thứ luôn\

### Cách 2 - Manual (Tạo project thủ công)

 1. Mở termial trong VS Code lên và nhập lệnh `npx create-next-app@latest my-next-app --typescript`, ở đây `my-next-app` chính là thư mục chưa code của project.
 2. Sau đó, sẽ có câu hỏi `Which linter would you like to use?` thì mình chọn `ESLint`
 3. Tương tự cho `Would you like to use React Compiler? » Yes`
 4. `Would you like to use Tailwind CSS? » Yes`
 5. `Would you like your code inside a "src/" directory? » Yes`
 6. `Would you like to use App Router? (recommended) » Yes`
 7. `Would you like to use Turbopack? (recommended) » Yes`
 8. `Would you like to customize the import alias ("@/*" by default)? » Yes`
 9. `What import alias would you like configured? » "@/*"`
 10. Sau khi đã làm xong các bước trên thì bây giờ cơ bản chúng ta đã có một dự án basic và dùng `npm install` để cài đặt tất cả **module** cần để chạy và `npm run dev` là trang web sẽ được chạy ở **localhost** ở máy chúng ta và thường là port **3000**. Ex:
```
▲ Next.js 16.0.1 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.8:3000
```
