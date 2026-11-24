"use client";

import { FormEvent, useEffect, useState } from "react";
import { Compass, MapPin, Users, CalendarDays, ShieldCheck, LogOut, Search, Star, Menu, X, Plus, Check, Ship, Leaf, Ticket, Settings, LayoutDashboard } from "lucide-react";
import "./demo.css";

type Role = "visitor" | "guide";
type Session = { account: "admin" | "user"; role: Role | null };
type Tour = { id: string; name: string; location: string; image: string; price: number; duration: string; published: boolean };
type Booking = { id: string; tourId: string; name: string; date: string; guests: number; status: "pending" | "confirmed" | "cancelled" };
type Data = { tours: Tour[]; bookings: Booking[]; userActive: boolean; headline: string };
const DATA_KEY = "touraro-demo-data-v1";
const SESSION_KEY = "touraro-demo-session-v1";
const initial: Data = {
  headline: "Chạm vào nhịp sống miền Tây.", userActive: true, bookings: [],
  tours: [
    { id: "cairang", name: "Một sớm trên chợ nổi Cái Răng", location: "Cái Răng, Cần Thơ", image: "/location_images/ChoNoi.png", price: 350000, duration: "4 giờ", published: true },
    { id: "conson", name: "Một ngày xanh trên Cồn Sơn", location: "Bình Thủy, Cần Thơ", image: "/location_images/ConSon.png", price: 490000, duration: "6 giờ", published: true },
    { id: "mykhanh", name: "Về vườn, tìm chút bình yên", location: "Phong Điền, Cần Thơ", image: "/location_images/MyKhanh.png", price: 290000, duration: "5 giờ", published: true },
  ],
};
const money = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
const statusText = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", cancelled: "Đã hủy" };

export default function DemoPortal() {
  const [data, setData] = useState<Data>(initial);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [login, setLogin] = useState(false);
  const [account, setAccount] = useState<"user" | "admin">("user");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("overview");
  const [bookingTour, setBookingTour] = useState<Tour | null>(null);
  const [addTour, setAddTour] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DATA_KEY) || "null");
      if (saved && Array.isArray(saved.tours) && Array.isArray(saved.bookings) && typeof saved.headline === "string" && typeof saved.userActive === "boolean") setData(saved);
      const current = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (current && ["admin", "user"].includes(current.account) && [null, "visitor", "guide"].includes(current.role) && (current.account === "admin" || saved?.userActive !== false)) setSession(current);
    } catch { /* Dữ liệu trình duyệt không hợp lệ: dùng bộ dữ liệu ban đầu. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { setNotice("Trình duyệt không cho lưu dữ liệu. Các thay đổi chỉ giữ trong lần mở này."); }
  }, [data, ready]);
  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Phiên vẫn hoạt động trong bộ nhớ. */ }
  }, [session, ready]);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(timer); } }, [notice]);
  useEffect(() => { setMobile(false); }, [tab, session]);
  useEffect(() => {
    if (!ready) return;
    const intent = new URLSearchParams(window.location.search).get("login");
    if (intent) { setAccount(intent === "admin" ? "admin" : "user"); setLogin(true); window.history.replaceState(null, "", "/"); }
  }, [ready]);
  useEffect(() => {
    if (!login && !bookingTour && !addTour) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const dialog = document.querySelector('[role="dialog"]');
      const controls = dialog?.querySelectorAll<HTMLElement>('button, input, a[href], [tabindex="0"]');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", trap); previous?.focus(); };
  }, [login, bookingTour, addTour]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setLogin(false); setBookingTour(null); setAddTour(false); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  const isAdmin = session?.account === "admin";
  const isGuide = session?.account === "user" && session.role === "guide";
  const choosing = session?.account === "user" && !session.role;
  const dashboard = isAdmin || isGuide;
  const visibleTours = data.tours.filter(t => t.published && `${t.name} ${t.location}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
  const logout = () => { setSession(null); setTab("overview"); setNotice("Bạn đã đăng xuất."); };
  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const expected = account === "admin" ? "admin@touraro.demo" : "user@touraro.demo";
    if (form.get("email") !== expected || form.get("password") !== "Demo@123") { setError("Email hoặc mật khẩu chưa đúng. Hãy dùng tài khoản demo bên dưới."); return; }
    if (account === "user" && !data.userActive) { setError("Tài khoản người dùng đã bị khóa. Hãy đăng nhập admin để mở lại."); return; }
    setSession({ account, role: null }); setLogin(false); setError(""); setTab("overview");
  }
  function requestBooking(tour: Tour) {
    if (!session) { setAccount("user"); setLogin(true); setNotice("Đăng nhập tài khoản người dùng để đặt trải nghiệm."); return; }
    if (session.role !== "visitor") return;
    setBookingTour(tour);
  }
  function saveBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!bookingTour || session?.account !== "user" || session.role !== "visitor") return;
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date")); const guests = Number(form.get("guests"));
    if (date < new Date().toLocaleDateString("en-CA") || guests < 1 || guests > 12) return;
    setData(prev => ({ ...prev, bookings: [...prev.bookings, { id: crypto.randomUUID(), tourId: bookingTour.id, name: String(form.get("name")), date, guests, status: "pending" }] }));
    setBookingTour(null); setNotice("Đã gửi yêu cầu đặt tour. Bạn có thể theo dõi tại Hành trình của tôi.");
  }
  function updateBooking(id: string, status: Booking["status"]) {
    if (!dashboard && status !== "cancelled") return;
    setData(prev => ({ ...prev, bookings: prev.bookings.map(b => b.id === id ? { ...b, status } : b) }));
    setNotice("Đã cập nhật yêu cầu đặt tour.");
  }
  function createTour(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!dashboard) return;
    const form = new FormData(event.currentTarget);
    const tour: Tour = { id: crypto.randomUUID(), name: String(form.get("name")).trim(), location: String(form.get("location")).trim(), price: Number(form.get("price")), duration: String(form.get("duration")), image: "/location_images/BNK.png", published: true };
    if (!tour.name || !tour.location || tour.price < 0) return;
    setData(prev => ({ ...prev, tours: [...prev.tours, tour] })); setAddTour(false); setNotice("Tour mới đã xuất hiện trong danh sách khám phá.");
  }
  const bookingList = <div className="tr-bookings">{data.bookings.length === 0 ? <div className="tr-empty"><Ticket size={38} /><h3>Hành trình mới đang chờ</h3><p>{dashboard ? "Các yêu cầu đặt tour sẽ xuất hiện tại đây." : "Chọn một trải nghiệm để bắt đầu khám phá Cần Thơ."}</p></div> : data.bookings.map(b => {
    const tour = data.tours.find(t => t.id === b.tourId);
    return <article className="tr-booking" key={b.id}><img src={tour?.image} alt="" /><div><h3>{tour?.name || "Tour đã lưu"}</h3><p>{b.name} · {b.date} · {b.guests} khách</p><span className={`tr-status ${b.status}`}>{statusText[b.status]}</span></div><div className="tr-actions">{dashboard && b.status === "pending" && <button className="tr-btn small" onClick={() => updateBooking(b.id, "confirmed")}><Check size={16} /> Xác nhận</button>}{b.status !== "cancelled" && <button className="tr-btn ghost small" onClick={() => updateBooking(b.id, "cancelled")}>Hủy yêu cầu</button>}</div></article>;
  })}</div>;

  return <div className="touraro-demo">
    <div className="tr-demo-strip">BẢN DEMO SẢN PHẨM <span>Ba trải nghiệm. Một Touraro.</span><span>Dữ liệu lưu trên trình duyệt</span></div>
    <header className="tr-header"><a className="tr-brand" href="/" aria-label="Touraro trang chủ"><span><Compass size={25} /></span>touraro<span className="tr-brand-dot">.</span></a>
      <nav className={mobile ? "open" : ""} aria-label="Điều hướng chính">{dashboard ? <><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Tổng quan</button><button className={tab === "bookings" ? "active" : ""} onClick={() => setTab("bookings")}>Yêu cầu đặt tour</button><button className={tab === "tours" ? "active" : ""} onClick={() => setTab("tours")}>Quản lý tour</button>{isAdmin && <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Tài khoản & nội dung</button>}</> : <><a href="#discover" onClick={() => { setTab("overview"); setMobile(false); }}>Khám phá</a><a href="#how-it-works" onClick={() => setMobile(false)}>Cách hoạt động</a>{session?.role === "visitor" && <button onClick={() => setTab(tab === "bookings" ? "overview" : "bookings")}>Hành trình của tôi <span className="tr-count">{data.bookings.length}</span></button>}</>}</nav>
      <div className="tr-account">{session ? <><span className="tr-role">{isAdmin ? "Quản trị viên" : isGuide ? "Hướng dẫn viên" : choosing ? "Người dùng" : "Khách tham quan"}</span>{session.account === "user" && <button className="tr-switch" onClick={() => { setSession({ account: "user", role: null }); setTab("overview"); }}>Đổi vai trò</button>}<button className="tr-icon" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={19} /></button></> : <button className="tr-btn small" disabled={!ready} onClick={() => { setLogin(true); setError(""); }}>Đăng nhập</button>}<button className="tr-icon tr-menu" onClick={() => setMobile(!mobile)} aria-label="Mở menu"><Menu /></button></div>
    </header>

    {choosing ? <main className="tr-role-page"><span className="tr-eyebrow">CHÀO MỪNG ĐẾN VỚI TOURARO</span><h1>Hôm nay, bạn muốn<br />trải nghiệm theo cách nào?</h1><p>Một tài khoản, hai cách kết nối với Cần Thơ.<br />Bạn có thể đổi vai trò bất cứ lúc nào.</p><div className="tr-role-grid"><button onClick={() => setSession({ account: "user", role: "visitor" })}><span className="tr-role-icon"><Compass size={35} /></span><span className="tr-eyebrow">DÀNH CHO NGƯỜI KHÁM PHÁ</span><h2>Khách tham quan</h2><p>Tìm điểm đến, đặt trải nghiệm và khám phá miền Tây cùng người bản địa.</p><span className="tr-role-cta">Bắt đầu khám phá</span></button><button onClick={() => setSession({ account: "user", role: "guide" })}><span className="tr-role-icon amber"><Users size={35} /></span><span className="tr-eyebrow">DÀNH CHO NGƯỜI KẾT NỐI</span><h2>Hướng dẫn viên du lịch</h2><p>Tạo tour của bạn, đón nhận yêu cầu và mang câu chuyện địa phương đến du khách.</p><span className="tr-role-cta">Mở không gian hướng dẫn viên</span></button></div></main> : dashboard ? <main className="tr-dashboard tr-container">
      <div className="tr-page-heading"><div><span className="tr-eyebrow">{isAdmin ? "TRUNG TÂM QUẢN TRỊ" : "KHÔNG GIAN HƯỚNG DẪN VIÊN"}</span><h1>{tab === "bookings" ? "Kết nối những hành trình." : tab === "tours" ? "Trải nghiệm do bạn tạo nên." : tab === "users" ? "Quản lý nền tảng." : isAdmin ? "Xin chào, Admin." : "Xin chào, người kể chuyện."}</h1><p>{isAdmin ? "Theo dõi và điều phối hoạt động trên cùng một nền tảng." : "Biến những hiểu biết địa phương thành trải nghiệm đáng nhớ."}</p></div><button className="tr-btn" onClick={() => setAddTour(true)}><Plus size={18} /> Tạo tour mới</button></div>
      {tab === "overview" && <><div className="tr-stats">{[["Trải nghiệm đang mở", data.tours.filter(t => t.published).length, <Compass key="a" />], ["Yêu cầu đặt tour", data.bookings.length, <Ticket key="b" />], ["Chờ xác nhận", data.bookings.filter(b => b.status === "pending").length, <CalendarDays key="c" />], ["Đã xác nhận", data.bookings.filter(b => b.status === "confirmed").length, <Check key="d" />]].map(([label, value, icon]) => <div key={String(label)}><span>{label}</span>{icon}<strong>{value}</strong></div>)}</div><div className="tr-section-head"><h2>Yêu cầu đặt tour</h2><button className="tr-text-btn" onClick={() => setTab("bookings")}>Xem tất cả</button></div>{bookingList}<div className="tr-note"><Leaf size={22} /><div><strong>Mỗi trải nghiệm là một kết nối.</strong><p>{isAdmin ? "Khách đặt tour, hướng dẫn viên xác nhận, admin theo dõi — tất cả trong một website." : "Tour bạn tạo sẽ hiển thị ngay ở không gian khách tham quan trong bản demo này."}</p></div></div></>}
      {tab === "bookings" && bookingList}
      {tab === "tours" && <div className="tr-manage-tours">{data.tours.map(t => <article className="tr-booking" key={t.id}><img src={t.image} alt="" /><div><h3>{t.name}</h3><p>{t.location} · {money(t.price)} / khách</p><span className={`tr-status ${t.published ? "confirmed" : "cancelled"}`}>{t.published ? "Đang hiển thị" : "Đã ẩn"}</span></div><button className="tr-btn ghost small" onClick={() => setData(prev => ({ ...prev, tours: prev.tours.map(tour => tour.id === t.id ? { ...tour, published: !tour.published } : tour) }))}>{t.published ? "Ẩn tour" : "Hiển thị tour"}</button></article>)}</div>}
      {tab === "users" && isAdmin && <div className="tr-settings"><section className="tr-panel"><h2><ShieldCheck /> Tài khoản demo</h2><p>Hai loại tài khoản. Người dùng chọn vai trò sau khi đăng nhập.</p><div className="tr-user-row"><div><strong>Quản trị viên</strong><p>admin@touraro.demo</p></div><span className="tr-status confirmed">Quản trị hệ thống</span></div><div className="tr-user-row"><div><strong>Người dùng</strong><p>user@touraro.demo · Khách / Hướng dẫn viên</p></div><button className="tr-btn ghost small" onClick={() => { setData(prev => ({ ...prev, userActive: !prev.userActive })); setNotice(data.userActive ? "Đã khóa tài khoản người dùng demo." : "Đã mở lại tài khoản người dùng demo."); }}>{data.userActive ? "Khóa tài khoản" : "Mở tài khoản"}</button></div><span className={`tr-status ${data.userActive ? "confirmed" : "cancelled"}`}>{data.userActive ? "Người dùng đang hoạt động" : "Người dùng đã bị khóa"}</span></section><form className="tr-panel tr-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); setData(prev => ({ ...prev, headline: String(form.get("headline")).trim() })); setNotice("Đã cập nhật tiêu đề trang khám phá."); }}><h2><Settings /> Nội dung trang khám phá</h2><label>Tiêu đề chính<input name="headline" defaultValue={data.headline} required maxLength={100} /></label><button className="tr-btn" type="submit">Lưu nội dung</button></form></div>}
    </main> : <main>{tab === "bookings" && session?.role === "visitor" ? <section className="tr-container tr-dashboard"><div className="tr-page-heading"><div><span className="tr-eyebrow">HÀNH TRÌNH CỦA TÔI</span><h1>Những cuộc hẹn với Cần Thơ.</h1><p>Theo dõi trạng thái yêu cầu và chuẩn bị cho trải nghiệm của bạn.</p></div><button className="tr-btn" onClick={() => setTab("overview")}>Khám phá thêm</button></div>{bookingList}</section> : <>
      <section className="tr-hero"><img className="tr-hero-image" src="/location_images/ChoNoi.png" alt="Thuyền trên sông tại chợ nổi Cái Răng, Cần Thơ" /><div className="tr-hero-shade" /><div className="tr-container tr-hero-content"><span className="tr-hero-label"><MapPin size={15} /> CẦN THƠ, VIỆT NAM</span><h1>{data.headline}</h1><p>Đi chậm một chút. Nghe câu chuyện của dòng sông.<br />Khám phá Cần Thơ cùng những người hiểu nơi này nhất.</p><a className="tr-btn light" href="#discover"><Compass size={19} /> Tìm trải nghiệm của bạn</a><div className="tr-hero-bottom"><span><Ship size={20} /> Sông nước & văn hóa bản địa</span><span><Users size={20} /> Kết nối hướng dẫn viên địa phương</span></div></div><div className="tr-photo-caption">Cái Răng · Một buổi sớm miền Tây</div></section>
      <section className="tr-intro tr-container"><div><span className="tr-eyebrow">KHÔNG CHỈ LÀ MỘT CHUYẾN ĐI</span><h2>Một nơi đến.<br />Nhiều điều để thương.</h2></div><p>Từ bữa sáng trên sông đến một chiều mát trong vườn, Touraro kết nối bạn với những trải nghiệm gần gũi và người dẫn đường bản địa.</p><span className="tr-intro-seal"><Leaf size={25} /> Đi gần hơn<br />Hiểu nhiều hơn</span></section>
      <section className="tr-discover tr-container" id="discover"><div className="tr-section-head"><div><span className="tr-eyebrow">ĐƯỢC CHỌN CHO BẠN</span><h2>Cần Thơ, theo cách của bạn.</h2></div><span className="tr-muted">Những trải nghiệm địa phương đáng thử</span></div><div className="tr-filter"><span className="tr-filter-label"><Compass size={17} /> Tất cả trải nghiệm</span><label className="tr-search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm trải nghiệm, địa điểm…" aria-label="Tìm trải nghiệm" /></label></div><div className="tr-tour-grid">{visibleTours.map((tour, index) => <article className="tr-tour-card" key={tour.id}><div className="tr-tour-photo"><img src={tour.image} alt={tour.name} /><span>{index === 0 ? "Được yêu thích" : "Trải nghiệm bản địa"}</span></div><div className="tr-tour-body"><div className="tr-tour-meta"><span><MapPin size={14} />{tour.location}</span><span><Star size={14} fill="currentColor" /> 4.9 <small>mẫu</small></span></div><h3>{tour.name}</h3><p><CalendarDays size={15} /> {tour.duration} · Có hướng dẫn viên địa phương</p><div className="tr-tour-bottom"><div><strong>{money(tour.price)}</strong><span> / khách</span></div><button className="tr-btn small" onClick={() => requestBooking(tour)}>Đặt trải nghiệm</button></div></div></article>)}</div>{visibleTours.length === 0 && <div className="tr-empty"><Search /><h3>Chưa tìm thấy trải nghiệm</h3><p>Thử từ khóa khác hoặc quay lại sau khi hướng dẫn viên mở tour mới.</p><button className="tr-text-btn" onClick={() => setQuery("")}>Xóa tìm kiếm</button></div>}</section>
      <section className="tr-how tr-container" id="how-it-works"><div><span className="tr-eyebrow">MỘT NỀN TẢNG, BA GÓC NHÌN</span><h2>Gặp nhau ở những<br />hành trình đẹp.</h2><p>Đăng nhập một lần. Chọn cách bạn muốn tham gia.</p><button className="tr-btn" onClick={() => { if (session) setSession({ account: "user", role: null }); else setLogin(true); }}>Bắt đầu với Touraro</button></div><div className="tr-how-items">{[[<Compass key="v" />, "Khách tham quan", "Khám phá trải nghiệm, gửi yêu cầu đặt tour và theo dõi hành trình."], [<Users key="g" />, "Hướng dẫn viên", "Tạo trải nghiệm địa phương và xác nhận yêu cầu của du khách."], [<LayoutDashboard key="a" />, "Quản trị viên", "Quản lý tài khoản, tour và nội dung trong cùng một không gian."]].map(([icon, title, text]) => <article key={String(title)}><span>{icon}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
    </>}</main>}
    <footer className="tr-footer tr-container"><a className="tr-brand" href="/">touraro.</a><p>Gần hơn với Cần Thơ. Gần hơn với nhau.</p><span>Demo · Không phát sinh thanh toán</span></footer>
    {notice && <div className="tr-toast" role="status"><Check size={18} />{notice}<button onClick={() => setNotice("")} aria-label="Đóng thông báo"><X size={16} /></button></div>}
    {login && <div className="tr-modal-backdrop"><section className="tr-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="tr-modal-close" onClick={() => setLogin(false)} aria-label="Đóng đăng nhập"><X /></button><span className="tr-eyebrow">CHÀO MỪNG BẠN TRỞ LẠI</span><h2 id="login-title">Bắt đầu hành trình.</h2><p>Chọn loại tài khoản để trải nghiệm bản demo.</p><div className="tr-login-tabs"><button className={account === "user" ? "active" : ""} onClick={() => { setAccount("user"); setError(""); }}><Users size={17} /> Người dùng</button><button className={account === "admin" ? "active" : ""} onClick={() => { setAccount("admin"); setError(""); }}><ShieldCheck size={17} /> Admin</button></div><form key={account} className="tr-form" onSubmit={signIn}><label>Email<input autoFocus name="email" type="email" autoComplete="username" required defaultValue={account === "admin" ? "admin@touraro.demo" : "user@touraro.demo"} /></label><label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required defaultValue="Demo@123" /></label>{error && <p className="tr-error" role="alert">{error}</p>}<button className="tr-btn" type="submit">{account === "admin" ? "Vào trang quản trị" : "Đăng nhập & chọn vai trò"}</button></form><div className="tr-credentials"><strong>Tài khoản demo đã được điền sẵn</strong><p>{account === "admin" ? "admin@touraro.demo" : "user@touraro.demo"} · Demo@123</p><span>{account === "user" ? "Sau đăng nhập: chọn Khách tham quan hoặc Hướng dẫn viên." : "Admin quản lý toàn bộ dữ liệu trình diễn."}</span></div><p className="tr-demo-note">Đây là đăng nhập mô phỏng trên trình duyệt, chưa kết nối hệ thống tài khoản thật.</p></section></div>}
    {bookingTour && <div className="tr-modal-backdrop"><section className="tr-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="tr-modal-close" onClick={() => setBookingTour(null)} aria-label="Đóng đặt tour"><X /></button><span className="tr-eyebrow">HẸN BẠN Ở CẦN THƠ</span><h2 id="booking-title">{bookingTour.name}</h2><p>{money(bookingTour.price)} / khách · {bookingTour.duration}</p><form className="tr-form" onSubmit={saveBooking}><label>Tên người tham gia<input autoFocus name="name" required maxLength={80} placeholder="Họ và tên của bạn" /></label><div className="tr-form-row"><label>Ngày tham quan<input name="date" type="date" min={new Date().toLocaleDateString("en-CA")} required /></label><label>Số khách<input name="guests" type="number" min="1" max="12" defaultValue="1" required /></label></div><p>Hướng dẫn viên sẽ xác nhận yêu cầu. Bản demo không thu tiền.</p><button className="tr-btn" type="submit">Gửi yêu cầu đặt tour</button></form></section></div>}
    {addTour && dashboard && <div className="tr-modal-backdrop"><section className="tr-modal" role="dialog" aria-modal="true" aria-labelledby="tour-title"><button className="tr-modal-close" onClick={() => setAddTour(false)} aria-label="Đóng tạo tour"><X /></button><span className="tr-eyebrow">CHIA SẺ ĐIỀU BẠN YÊU</span><h2 id="tour-title">Tạo trải nghiệm mới.</h2><form className="tr-form" onSubmit={createTour}><label>Tên tour<input autoFocus name="name" required maxLength={100} placeholder="Ví dụ: Chiều dạo bến Ninh Kiều" /></label><label>Địa điểm<input name="location" required maxLength={100} placeholder="Ninh Kiều, Cần Thơ" /></label><div className="tr-form-row"><label>Giá / khách (VNĐ)<input name="price" type="number" min="0" max="100000000" step="1000" required defaultValue="200000" /></label><label>Thời lượng<input name="duration" required placeholder="3 giờ" maxLength={30} /></label></div><p>Tour dùng ảnh bến Ninh Kiều trong bộ ảnh demo.</p><button className="tr-btn" type="submit">Đăng tour</button></form></section></div>}
  </div>;
}
