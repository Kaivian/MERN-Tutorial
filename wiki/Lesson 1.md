# Lesson 1 - Ngôn ngữ
Nè nè tự làm thử cho mình một cái **Portfolio** chưa mà qua đây, nếu mà chưa thì thử mò rồi làm thử một cái đơn giản đi nha, `HTML`, `CSS`, `Javascript` bình thường thôi cũng được, nếu mà bí quá thì có thể tham khảo code ở [Chapter 2](https://github.com/Kaivian/MERN-Tutorial/wiki/Chapter-2), và [Chapter 3](https://github.com/Kaivian/MERN-Tutorial/wiki/Chapter-3) nha. Thử mò để xem coi cái đó là cái gì rồi quay lại đây nhen! Còn nếu đã thử làm rồi thì chúng ta vào với bài đầu tiên nha.

## Front-end là gì?

Giờ **Front-end** là nó code cái gì đây, thì đúng như cái tên đó nó code cái phần phía trước, tức là cái `giao diện tương tác với người dùng` **UI (User Interface)**, và còn thêm một cái gọi là **UX (User Experience) - Trãi nghiệm của người dùng** nhưng phần đó chúng ta sẽ nói vào bài khác nha.

Front-end có rất nhiều ngôn ngữ để lập trình như `PHP`, `JSX`, hay `TSX`,… Nhưng suy cho cùng, những gì người dùng nhìn thấy vẫn được hiển thị bằng **HTML**, và phần giao diện, bố cục của trang web được định dạng chủ yếu nhờ **CSS**.

Rồi vậy thì ngôn ngữ nào đang phổ biến nhất:

-   **JavaScript**: Vẫn là “ngôn ngữ bắt buộc” cho front-end. Rất nhiều nhà tuyển dụng yêu cầu JavaScript.
-   **TypeScript**: Đang tăng mạnh vì giúp codebase front-end/React trở nên bền vững hơn, nhiều công việc yêu cầu TS. 
-   Đối với front-end framework: **React.js** dẫn đầu; tiếp theo là **Angular** và **Vue.js**.

Ở phần tutorial này thì mình sẽ nói đến `JavaScript`, `TypeScript` và frameword `React.js` thôi nha. 

Ok, giờ ta nói tới **Back-end**, tức là “phần phía sau” của ứng dụng web. Nếu **Front-end** là phần người dùng thấy và tương tác (UI/UX), thì **Back-end** chính là phần xử lý logic, dữ liệu, xác thực, và kết nối với cơ sở dữ liệu.

Nói ngắn gọn:
> Front-end là cái _“màn hình hiển thị”_, còn Back-end là _“linh kiện bên trong máy tính”_.

## Back-end trong MERN bao gồm gì?

MERN là viết tắt của **MongoDB – Express.js – React.js – Node.js**, trong đó phần **Back-end** chính là:

-   **Node.js** → môi trường chạy JavaScript ở phía server (chứ không phải trình duyệt).  
    → Nói cách khác: ta có thể dùng cùng một ngôn ngữ (JavaScript) cho cả front-end và back-end.
    
-   **Express.js** → framework chạy trên Node.js giúp ta dễ dàng tạo **API**, xử lý **HTTP request**, **route**, và **middleware**.  
    → Nó giúp code của bạn gọn gàng, tách biệt rõ giữa logic và dữ liệu.
    
-   **MongoDB** → cơ sở dữ liệu NoSQL dạng document, lưu trữ dữ liệu dưới dạng JSON (hoặc gần giống JSON).  
    → Rất linh hoạt, phù hợp cho web hiện đại và đặc biệt là dự án MERN vì dễ tích hợp với JavaScript.

Các câu hỏi liên quan có thể được tìm thấy ở [phần mở đầu](https://github.com/Kaivian/MERN-Tutorial/wiki), nếu bạn có thắc mắc hoặc có thể thử tìm hiểu ở đâu đó.

## Tổng kết

| Thành phần     | Vai trò                   | Ngôn ngữ chính          |
| -------------- | ------------------------- | ----------------------- |
| **React.js**   | Giao diện người dùng (UI) | JavaScript / TypeScript |
| **Node.js**    | Nền tảng chạy back-end    | JavaScript              |
| **Express.js** | Framework xử lý server    | JavaScript              |
| **MongoDB**    | Cơ sở dữ liệu             | BSON / JSON             |

## Câu hỏi:

<details>
<summary>Vì sao lại chọn **React** cho front-end mà không phải là cái khác?</summary>
  
React được tạo ra bởi **Meta (Facebook)** và hiện là framework front-end phổ biến nhất thế giới.

Lý do chọn React thay vì các framework khác như Angular hay Vue:

1. **Tư duy component-based** → Chia nhỏ giao diện thành từng phần (component) tái sử dụng được.

2. **Cộng đồng cực lớn** → Tài liệu, thư viện hỗ trợ, video hướng dẫn rất nhiều. 
   
3. **Hiệu năng cao** → Cơ chế Virtual DOM giúp cập nhật giao diện nhanh hơn mà không phải render lại toàn bộ trang.  

4. **Dễ học – dễ mở rộng** → Chỉ cần biết JavaScript là có thể bắt đầu. Sau này học thêm TypeScript hoặc Next.js cũng rất dễ tích hợp.

5. **Được doanh nghiệp tin dùng** → Netflix, Meta, Airbnb, Discord,… đều dùng React trong sản phẩm của họ.

> Tóm lại: React cân bằng giữa **đơn giản, hiệu suất và khả năng mở rộng**, nên là lựa chọn lý tưởng cho người mới và cả doanh nghiệp lớn.
</details>

<details>
<summary>Vì sao lại chọn MongoDB để làm cơ sở dữ liệu?</summary>
  
MongoDB là cơ sở dữ liệu NoSQL dạng document (JSON-like), rất phù hợp với ứng dụng web hiện đại.

Vì sao chọn MongoDB:

1. Lưu dữ liệu linh hoạt → Không cần schema cố định, có thể thay đổi cấu trúc dữ liệu dễ dàng.

2. Tương thích tự nhiên với JavaScript → Dữ liệu dạng JSON nên dễ thao tác giữa front-end và back-end.

3. Hiệu năng tốt khi scale → Dễ mở rộng, chạy ổn định cho ứng dụng nhiều người dùng.

4. Cộng đồng mạnh & dễ dùng → MongoDB Compass cho phép quản lý dữ liệu trực quan, dễ học hơn SQL.

> Nói ngắn gọn: MongoDB “hợp rơ” với Node.js và React — tất cả đều nói chung một “ngôn ngữ” là JSON.
</details>

<details>
<summary>MERN có ưu điểm gì vượt trội so với PHP, Java, Angular?</summary>

| So sánh                 | MERN (Mongo + Express + React + Node)        | PHP / Java / Angular                                |
| ----------------------- | -------------------------------------------- | --------------------------------------------------- |
| **Ngôn ngữ chính**      | Chỉ cần JavaScript cho toàn bộ stack         | Phải học thêm nhiều ngôn ngữ (PHP, SQL, Java, v.v.) |
| **Hiệu năng**           | Node.js non-blocking, xử lý song song tốt    | PHP/Java xử lý tuần tự, chậm hơn với real-time app  |
| **Kiến trúc hiện đại**  | Dựa trên API + JSON → dễ làm SPA, mobile app | Thường phụ thuộc vào template server-side           |
| **Triển khai (Deploy)** | Dễ triển khai toàn bộ stack lên 1 server     | Backend, frontend, DB tách biệt, setup phức tạp hơn |
| **Độ linh hoạt**        | Linh hoạt, code ít ràng buộc                 | Framework nặng, nhiều quy tắc cố định               |

</details>

<details>
<summary>Học cái này có khó không?</summary>

Không khó, nhưng phải đi đúng trình tự.  
MERN không đòi hỏi học nhiều ngôn ngữ, nhưng lại đòi hỏi hiểu cách các phần kết nối với nhau.

Cách tiếp cận hợp lý:
1. Nắm vững HTML, CSS, JavaScript → nền tảng front-end.

2. Học React.js → xây giao diện động.

3. Học Node.js + Express.js → tạo server và API.

4. Học MongoDB → lưu và truy xuất dữ liệu.

5. Ghép lại thành Full MERN App → hiểu luồng dữ liệu xuyên suốt.

> Nếu bạn đã quen code logic Java hoặc C++ rồi, thì MERN sẽ rất “mượt” — vì nó dùng chung tư duy lập trình, chỉ khác cú pháp và cách làm việc với web.
</details>