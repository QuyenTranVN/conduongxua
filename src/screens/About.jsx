import { AppBar } from '../components/Chrome.jsx'
import { useApp } from '../lib/store.jsx'

export default function About() {
  const { lang } = useApp()

  if (lang === 'en') {
    return <><AppBar title='About' /><div className='scroll has-mini about-page buddhist-page-background'>
      <article className='about-article'>
        <figure className='about-hero'>
          <img src='/images/Intro/IMG_5670.jpeg' alt='Hands joined before a Buddha shrine at a temple' />
        </figure>
        <header><h1>About Con Đường Xưa</h1><p className='about-lead'>A small place for learning and practice</p></header>

        <p><strong>Con Đường Xưa</strong> was created with a simple wish: to build an accessible place for anyone who wants to <strong>meditate, listen to Dhamma, and learn about Theravāda Buddhism</strong>.</p>
        <p>I did not create this app for commercial purposes.</p>
        <p>Con Đường Xưa is built as a <strong>free resource</strong> that anyone can turn to when they want to sit in meditation, listen to a Dhamma talk, learn about a teacher, or simply spend a few quiet minutes each day.</p>

        <section><h2>Why did I build this app?</h2>
          <p>As I learned and practised, I found valuable material scattered across many places: YouTube, websites, audio talks, temple resources, and different Buddhist communities.</p>
          <p>For someone just beginning, it can be difficult to know:</p>
          <ul><li>where to start;</li><li>which talk to listen to;</li><li>how to meditate;</li><li>which teacher to learn from;</li><li>and where the material comes from.</li></ul>
          <p>So I wanted to bring suitable resources together in one simpler place.</p>
          <p>Con Đường Xưa currently focuses on three main areas:</p>
          <div className='about-pillars'>
            <div><strong>Meditation</strong><span>Helping people begin and maintain a simple practice.</span></div>
            <div><strong>Dhamma talks</strong><span>Bringing together valuable teachings to listen to in daily life.</span></div>
            <div><strong>Teachers</strong><span>Helping people explore each teacher's teachings, practices, and tradition.</span></div>
          </div>
        </section>

        <section><h2>Not a replacement for a teacher</h2>
          <p>Con Đường Xưa was not created to become a new “teacher.”</p>
          <p>The app simply serves as a <strong>bridge</strong> between learners and existing teachings, resources, and teachers.</p>
          <p>Wherever possible, content will clearly identify:</p>
          <ul><li>the source;</li><li>the teacher;</li><li>the tradition;</li><li>the original link;</li><li>and relevant information.</li></ul>
          <p>The aim is to help people continue learning from the original source.</p>
        </section>

        <section><h2>Completely free</h2>
          <p>I hope that teachings and meditation resources can be easily accessible to everyone.</p>
          <p>For that reason, Con Đường Xưa is guided by one principle:</p>
          <p className='about-emphasis'>Free for everyone.</p>
          <p>No fee to listen to a Dhamma talk.</p><p>No essential meditation content locked behind a subscription.</p><p>No turning practice into points or competition.</p>
          <p>Simply a place you can open whenever you need it and begin practising.</p>
        </section>

        <section><h2>Acknowledgements</h2>
          <p>Con Đường Xưa would not have had its initial collection of useful content without those who devoted time to preserving and sharing these teachings.</p>
          <p>I am especially grateful to <a href='https://www.youtube.com/@thienduongsinhdasiranarada' target='_blank' rel='noreferrer'><strong>Thiền Dưỡng Sinh DASIRA NARADA</strong></a> for trusting me and allowing the use of guided-meditation audio in this app.</p>
          <p>That permission and generosity help these teachings reach more people in a new form.</p>
          <p>Some audio in the app has also been researched and collected from <a href='https://theravada.vn/' target='_blank' rel='noreferrer'><strong>Theravāda.vn</strong></a>. I deeply appreciate the work involved in preserving, editing, and sharing its Buddhist resources.</p>
          <p>The app also hosts collections of <strong>Ajahn Chah Dhamma talks</strong> and <strong>guided meditations by Ajahn Brahm</strong>. Their original sources, links, and copyright status are still being verified and documented.</p>
          <p>Every effort will be made to provide clear attribution and respect the owners of all audio content.</p>
          <p><strong>With sincere gratitude.</strong></p>
        </section>

        <section><h2>Con Đường Xưa will continue to grow</h2>
          <p>The app is still being developed.</p><p>I will continue to:</p>
          <ul><li>add suitable meditation sessions;</li><li>organise more Dhamma talks;</li><li>build teacher profiles;</li><li>verify content sources;</li><li>add places to practise;</li><li>and personally research and record more information when I can visit places of practice.</li></ul>
          <p>I do not hope for Con Đường Xưa to become the app with the most features.</p>
          <p>I simply hope it becomes a <strong>simple, trustworthy, and useful</strong> place for those who genuinely want to learn and practise.</p>
        </section>

        <blockquote>Learn the Dhamma. Practise the Dhamma. Experience it for yourself.</blockquote>
        <p className='about-signature'>Con Đường Xưa</p>
      </article>
    </div></>
  }

  return <><AppBar title='Giới thiệu' /><div className='scroll has-mini about-page buddhist-page-background'>
    <article className='about-article'>
      <figure className='about-hero'>
        <img src='/images/Intro/IMG_5670.jpeg' alt='Chắp tay trước Phật điện tại một ngôi chùa' />
      </figure>
      <header><h1>Giới thiệu Con Đường Xưa</h1><p className='about-lead'>Một nơi nhỏ dành cho việc học và thực hành</p></header>

      <p><strong>Con Đường Xưa</strong> được tạo ra với một mong muốn rất đơn giản: xây dựng một nơi dễ tiếp cận cho những ai muốn <strong>thiền, nghe Pháp và tìm hiểu Đạo Phật Nguyên Thuỷ (Theravāda)</strong>.</p>
      <p>Tôi không tạo ứng dụng này với mục đích thương mại.</p>
      <p>Con Đường Xưa được xây dựng như một <strong>nguồn tài nguyên miễn phí</strong>, để mọi người có thể tìm đến khi muốn ngồi thiền một lúc, nghe một bài Pháp, tìm hiểu thêm về một vị thầy, hoặc đơn giản là dành cho mình vài phút yên tĩnh mỗi ngày.</p>

      <section><h2>Vì sao tôi xây dựng ứng dụng này?</h2>
        <p>Trong quá trình tìm hiểu và thực hành, tôi nhận ra rằng có rất nhiều nội dung giá trị đang nằm rải rác ở nhiều nơi: YouTube, website, các bài giảng âm thanh, tài liệu của các chùa và những cộng đồng Phật tử khác nhau.</p>
        <p>Với một người mới bắt đầu, đôi khi rất khó để biết:</p>
        <ul><li>nên bắt đầu từ đâu;</li><li>nên nghe bài nào;</li><li>thiền như thế nào;</li><li>tìm hiểu từ vị thầy nào;</li><li>và nguồn nội dung đến từ đâu.</li></ul>
        <p>Vì vậy, tôi muốn tập hợp những tài nguyên phù hợp vào một nơi đơn giản hơn.</p>
        <p>Con Đường Xưa hiện tập trung vào ba điều chính:</p>
        <div className='about-pillars'>
          <div><strong>Thiền</strong><span>Giúp người dùng bắt đầu và duy trì việc thực hành một cách đơn giản.</span></div>
          <div><strong>Nghe Pháp</strong><span>Tập hợp những bài giảng có giá trị để có thể nghe trong cuộc sống hằng ngày.</span></div>
          <div><strong>Các vị thầy</strong><span>Giúp người dùng tìm hiểu bài giảng, phương pháp thực hành và truyền thống của từng vị thầy.</span></div>
        </div>
      </section>

      <section><h2>Không phải để thay thế người thầy</h2>
        <p>Con Đường Xưa không được tạo ra để trở thành một “người thầy” mới.</p>
        <p>Ứng dụng chỉ đóng vai trò như một <strong>cầu nối</strong> giữa người học với những bài giảng, nguồn tài liệu và những vị thầy đã có sẵn.</p>
        <p>Khi có thể, nội dung sẽ luôn được ghi rõ:</p>
        <ul><li>nguồn;</li><li>vị thầy;</li><li>truyền thống;</li><li>đường dẫn gốc;</li><li>và thông tin liên quan.</li></ul>
        <p>Mục tiêu là để người dùng có thể tiếp tục tìm hiểu từ chính nguồn ban đầu.</p>
      </section>

      <section><h2>Hoàn toàn miễn phí</h2>
        <p>Tôi mong muốn những nội dung phục vụ cho việc học Pháp và thực hành thiền có thể được tiếp cận một cách dễ dàng.</p>
        <p>Vì vậy, Con Đường Xưa được xây dựng với định hướng:</p>
        <p className='about-emphasis'>Miễn phí cho mọi người.</p>
        <p>Không tính phí để nghe một bài Pháp.</p><p>Không khóa những nội dung thiền quan trọng phía sau gói trả phí.</p><p>Không biến việc thực hành thành điểm số hay cuộc thi.</p>
        <p>Chỉ đơn giản là tạo ra một nơi mà khi cần, bạn có thể mở lên và bắt đầu thực hành.</p>
      </section>

      <section><h2>Lời cảm ơn</h2>
        <p>Con Đường Xưa sẽ không thể có những nội dung hữu ích ban đầu nếu không có sự chia sẻ và hỗ trợ từ những người đã dành thời gian lưu giữ và phổ biến các bài giảng.</p>
        <p>Tôi đặc biệt biết ơn <a href='https://www.youtube.com/@thienduongsinhdasiranarada' target='_blank' rel='noreferrer'><strong>Thiền Dưỡng Sinh DASIRA NARADA</strong></a> đã tin tưởng và cho phép tôi sử dụng các nội dung âm thanh hướng dẫn thiền trong ứng dụng này.</p>
        <p>Sự cho phép và chia sẻ đó giúp những bài giảng có thể tiếp tục đến với nhiều người hơn thông qua một hình thức mới.</p>
        <p>Một số nội dung âm thanh trong ứng dụng cũng được tìm hiểu và sưu tầm từ <a href='https://theravada.vn/' target='_blank' rel='noreferrer'><strong>Theravāda.vn</strong></a>. Tôi trân trọng công sức lưu giữ, biên tập và chia sẻ các tài liệu Phật pháp của trang.</p>
        <p>Ứng dụng cũng đang lưu trữ các bộ sưu tập <strong>Pháp thoại Ajahn Chah</strong> và <strong>Hướng dẫn thiền định · Ajahn Brahm</strong>. Thông tin nguồn gốc, đường dẫn gốc và tình trạng bản quyền của các bộ sưu tập này đang được tiếp tục xác minh và bổ sung.</p>
        <p>Tất cả audio được sử dụng sẽ luôn cố gắng giữ thông tin nguồn rõ ràng và tôn trọng người sở hữu nội dung.</p>
        <p><strong>Xin chân thành tri ân.</strong></p>
      </section>

      <section><h2>Con Đường Xưa sẽ tiếp tục được hoàn thiện</h2>
        <p>Ứng dụng vẫn đang trong quá trình xây dựng.</p><p>Tôi sẽ tiếp tục:</p>
        <ul><li>bổ sung những bài thiền phù hợp;</li><li>sắp xếp thêm các bài Pháp;</li><li>xây dựng hồ sơ các vị thầy;</li><li>kiểm tra nguồn nội dung;</li><li>bổ sung địa điểm thực hành;</li><li>và tự mình tìm hiểu, ghi nhận thêm thông tin khi có cơ hội đến những nơi thực hành.</li></ul>
        <p>Tôi không mong Con Đường Xưa trở thành ứng dụng có nhiều tính năng nhất.</p>
        <p>Tôi chỉ mong nó trở thành một nơi <strong>đơn giản, đáng tin cậy và hữu ích</strong> cho những ai thật sự muốn học và thực hành.</p>
      </section>

      <blockquote>Học Pháp. Hành Pháp. Tự mình trải nghiệm.</blockquote>
      <p className='about-signature'>Con Đường Xưa</p>
    </article>
  </div></>
}
