import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Car, ShoppingCart, User, Shield, Search, Plus, Edit, Trash2, 
  CheckCircle, Clock, AlertCircle, DollarSign, FileText, Send, 
  Sparkles, ChevronRight, BarChart3, TrendingUp, Key, Bell, HelpCircle
} from 'lucide-react';

// ==========================================
// 1. LESSON 8: CONTEXT API - STORE TOÀN CỤC
// ==========================================
const AppContext = createContext();

const initialCars = [
  { id: 1, name: 'Toyota Camry 2.5Q', price: 1050000000, year: 2022, status: 'Available', type: 'Showroom', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600' },
  { id: 2, name: 'Mercedes-Benz C300 AMG', price: 1890000000, year: 2023, status: 'Available', type: 'Showroom', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600' },
  { id: 3, name: 'Ford Ranger Wildtrak 2.0L', price: 850000000, year: 2021, status: 'Available', type: 'Consignment', commission: 2.5, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600' },
];

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState('Customer'); // 'Customer' | 'Admin'
  const [activeTab, setActiveTab] = useState('vehicles');
  const [cars, setCars] = useState(initialCars);
  const [orders, setOrders] = useState([
    { id: 'ORD-101', carName: 'Toyota Camry 2.5Q', customer: 'Nguyễn Văn A', amount: 1050000000, status: 'Pending', date: '2026-10-01' }
  ]);
  const [sellRequests, setSellRequests] = useState([
    { id: 'REQ-01', carName: 'Honda CR-V L', expectedPrice: 900000000, owner: 'Trần Văn B', phone: '0987654321', status: 'Pending' }
  ]);

  // Lesson 1 & 2: JS Utils (Tính toán tài chính)
  const totalRevenue = orders.reduce((sum, order) => sum + (order.status === 'Completed' ? order.amount : 0), 0);

  const addCar = (newCar) => setCars([...cars, { ...newCar, id: Date.now() }]);
  const deleteCar = (id) => setCars(cars.filter(c => c.id !== id));
  
  const createOrder = (car) => {
    const newOrder = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      carName: car.name,
      customer: 'Nguyễn Hải Nam',
      amount: car.price,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setOrders([newOrder, ...orders]);
    alert(`Đặt mua thành công xe ${car.name}! Vui lòng theo dõi đơn hàng.`);
  };

  const addSellRequest = (req) => {
    setSellRequests([{ ...req, id: `REQ-0${sellRequests.length + 1}`, status: 'Pending' }, ...sellRequests]);
    alert('Đã gửi yêu cầu nhờ đăng bán xe hộ thành công!');
  };

  return (
    <AppContext.Provider value={{ 
      role, setRole, activeTab, setActiveTab, 
      cars, addCar, deleteCar, 
      orders, setOrders, createOrder, 
      sellRequests, setSellRequests, addSellRequest,
      totalRevenue
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

// ==========================================
// 2. LESSON 11: GEMINI API HOOK (TƯ VẤN AI)
// ==========================================
const useGeminiConsultant = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const consultCar = async (budget, preference) => {
    setLoading(true);
    setResponse('');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Giả lập phản hồi thông minh nếu chưa gắn API key thật
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      setTimeout(() => {
        setResponse(`[AI Autohunt Advisor]: Với ngân sách khoảng ${(budget/1000000).toFixed(0)} triệu VNĐ và nhu cầu "${preference}", bạn nên chọn dòng xe Sedan như Toyota Camry (độ bền cao, giữ giá) hoặc SUV Ford Ranger (mạnh mẽ, đa dụng).`);
        setLoading(false);
      }, 1200);
      return;
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Tôi có ngân sách ${budget} VNĐ, thích xe dạng: ${preference}. Hãy tư vấn 2 mẫu xe phù hợp ngắn gọn.` }] }]
        })
      });
      const data = await res.json();
      setResponse(data.candidates[0].content.parts[0].text);
    } catch (err) {
      setResponse('Lỗi kết nối AI. Vui lòng kiểm tra lại cấu hình API key.');
    } finally {
      setLoading(false);
    }
  };

  return { consultCar, loading, response };
};

// ==========================================
// 3. COMPONENTS: TÁC NHÂN KHÁCH HÀNG (CUSTOMER)
// ==========================================
const CustomerView = () => {
  const { cars, createOrder, addSellRequest, orders } = useApp();
  const { consultCar, loading, response } = useGeminiConsultant();
  
  // Lesson 4: State
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetInput, setBudgetInput] = useState(1000000000);
  const [preferenceInput, setPreferenceInput] = useState('Gia đình, tiết kiệm xăng');
  
  // Form nhờ bán xe hộ
  const [sellForm, setSellForm] = useState({ carName: '', expectedPrice: '', phone: '', note: '' });

  // Lesson 1 & 2: JS Filter
  const filteredCars = cars.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* AI Assistant Section (Lesson 11 - Gemini API) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-yellow-400 w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-bold">Trợ Lý AI Autohunt - Tư Vấn Mua Xe Thông Minh</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            type="number" 
            placeholder="Ngân sách (VNĐ)" 
            value={budgetInput}
            onChange={(e) => setBudgetInput(Number(e.target.value))}
            className="px-4 py-2 text-black rounded-lg text-sm"
          />
          <input 
            type="text" 
            placeholder="Nhu cầu (VD: Gia đình, Thể thao...)" 
            value={preferenceInput}
            onChange={(e) => setPreferenceInput(e.target.value)}
            className="px-4 py-2 text-black rounded-lg text-sm"
          />
          <button 
            onClick={() => consultCar(budgetInput, preferenceInput)}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            {loading ? 'Đang phân tích...' : 'Nhận Tư Vấn AI'}
          </button>
        </div>
        {response && (
          <div className="bg-white/10 p-4 rounded-xl text-sm border border-white/20">
            {response}
          </div>
        )}
      </div>

      {/* CTM-VEH01: Tìm kiếm xe */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Danh Sách Xe Đang Bán</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm mẫu xe..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lesson 4: Props & List Rendering */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCars.map(car => (
            <div key={car.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={car.image} alt={car.name} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-2">
                <span className={`text-xs px-2 py-1 rounded font-semibold ${car.type === 'Consignment' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {car.type === 'Consignment' ? 'Xe Ký Gửi' : 'Showroom Autohunt'}
                </span>
                <h4 className="font-bold text-lg text-gray-800">{car.name}</h4>
                <p className="text-sm text-gray-500">Năm sản xuất: {car.year}</p>
                <p className="text-lg font-bold text-red-600">{car.price.toLocaleString()} VNĐ</p>
                <button 
                  onClick={() => createOrder(car)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  CTM-ORD01: Đặt Mua Xe
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTM-SLL01: Nhờ đăng bán xe (Ký gửi) */}
      <div className="bg-white p-6 border rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-2">CTM-SLL01: Đăng Ký Nhờ Admin Bán Xe Hộ (Ký Gửi)</h3>
        <p className="text-sm text-gray-500 mb-4">Nhập thông tin xe của bạn, Admin Autohunt sẽ hỗ trợ định giá và đăng bán với phí hoa hồng ưu đãi.</p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          addSellRequest(sellForm);
          setSellForm({ carName: '', expectedPrice: '', phone: '', note: '' });
        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" required placeholder="Tên dòng xe cần bán" 
            value={sellForm.carName} onChange={e => setSellForm({...sellForm, carName: e.target.value})}
            className="border p-2 rounded text-sm"
          />
          <input 
            type="number" required placeholder="Giá mong muốn (VNĐ)" 
            value={sellForm.expectedPrice} onChange={e => setSellForm({...sellForm, expectedPrice: e.target.value})}
            className="border p-2 rounded text-sm"
          />
          <input 
            type="text" required placeholder="Số điện thoại liên hệ" 
            value={sellForm.phone} onChange={e => setSellForm({...sellForm, phone: e.target.value})}
            className="border p-2 rounded text-sm"
          />
          <input 
            type="text" placeholder="Ghi chú tình trạng xe" 
            value={sellForm.note} onChange={e => setSellForm({...sellForm, note: e.target.value})}
            className="border p-2 rounded text-sm"
          />
          <button type="submit" className="md:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-semibold">
            Gửi Yêu Cầu Bán Hộ
          </button>
        </form>
      </div>

      {/* CTM-ORD02 & CTM-SHP01: Lịch sử & Theo dõi giao xe */}
      <div className="bg-white p-6 border rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">CTM-ORD02 & CTM-SHP01: Lịch Sử Đơn Hàng & Giao Xe</h3>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="flex justify-between items-center border-b pb-3 text-sm">
              <div>
                <p className="font-bold text-gray-800">{order.carName} - <span className="text-gray-500">{order.id}</span></p>
                <p className="text-xs text-gray-400">Ngày đặt: {order.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-red-600">{order.amount.toLocaleString()} VNĐ</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. COMPONENTS: TÁC NHÂN ADMIN (QUẢN TRỊ)
// ==========================================
const AdminView = () => {
  const { cars, addCar, deleteCar, orders, setOrders, sellRequests, totalRevenue } = useApp();
  
  // State form xe mới
  const [newCar, setNewCar] = useState({ name: '', price: '', year: 2023, type: 'Showroom', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600' });

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-8">
      {/* AD-ADM05 & AD-ADM10: Tổng quan báo cáo & Tài chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><BarChart3 /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Tổng Xe Hệ Thống</p>
            <p className="text-2xl font-black text-gray-800">{cars.length} chiếc</p>
          </div>
        </div>
        <div className="bg-white p-5 border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Tổng Đơn Hàng</p>
            <p className="text-2xl font-black text-gray-800">{orders.length} đơn</p>
          </div>
        </div>
        <div className="bg-white p-5 border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><DollarSign /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Doanh Thu Đã Thực Thu</p>
            <p className="text-2xl font-black text-purple-700">{totalRevenue.toLocaleString()} VNĐ</p>
          </div>
        </div>
      </div>

      {/* AD-ADM01: Quản lý đăng xe */}
      <div className="bg-white p-6 border rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">AD-ADM01: Thêm Xe Mới Vào Showroom</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          addCar({ ...newCar, price: Number(newCar.price), year: Number(newCar.year), status: 'Available' });
          setNewCar({ name: '', price: '', year: 2023, type: 'Showroom', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600' });
        }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" required placeholder="Tên xe" 
            value={newCar.name} onChange={e => setNewCar({...newCar, name: e.target.value})}
            className="border p-2 rounded text-sm"
          />
          <input 
            type="number" required placeholder="Giá bán (VNĐ)" 
            value={newCar.price} onChange={e => setNewCar({...newCar, price: e.target.value})}
            className="border p-2 rounded text-sm"
          />
          <input 
            type="number" required placeholder="Năm sản xuất" 
            value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})}
            className="border p-2 rounded text-sm"
          />
          <button type="submit" className="bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            + Thêm Xe
          </button>
        </form>
      </div>

      {/* AD-ADM02: Quản lý đơn hàng */}
      <div className="bg-white p-6 border rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">AD-ADM02: Quản Lý Đơn Hàng Mua Xe</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Mã Đơn</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Tên Xe</th>
                <th className="p-3">Giá Trị</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{order.id}</td>
                  <td className="p-3">{order.customer}</td>
                  <td className="p-3">{order.carName}</td>
                  <td className="p-3 font-bold text-red-600">{order.amount.toLocaleString()} VNĐ</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Completed')}
                      className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                    >
                      Duyệt Bàn Giao
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AD-ADM11: Duyệt Xe Ký Gửi & Tính Hoa Hồng */}
      <div className="bg-white p-6 border rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">AD-ADM11: Quản Lý Yêu Cầu Đăng Bán Xe Hộ (Tính Hoa Hồng)</h3>
        <div className="space-y-4">
          {sellRequests.map(req => (
            <div key={req.id} className="border p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{req.carName} - Giá kỳ vọng: {Number(req.expectedPrice).toLocaleString()} VNĐ</p>
                <p className="text-xs text-gray-500">Chủ xe: {req.owner} ({req.phone})</p>
                {/* Công thức tính hoa hồng 2% */}
                <p className="text-xs font-semibold text-indigo-600 mt-1">
                  Hoa hồng dự kiến thu (2%): {(req.expectedPrice * 0.02).toLocaleString()} VNĐ
                </p>
              </div>
              <button 
                onClick={() => {
                  addCar({ name: req.carName, price: Number(req.expectedPrice), year: 2022, status: 'Available', type: 'Consignment', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600' });
                  alert('Đã duyệt và đăng bán xe lên hệ thống!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                Duyệt Đăng Bán
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN APP COMPONENT CONTAINER
// ==========================================
export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

const MainLayout = () => {
  const { role, setRole } = useApp();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-blue-500" />
            <span className="font-black text-xl tracking-wider text-blue-400">AUTOHUNT</span>
          </div>

          {/* Phân quyền Vai Trò (Role Switching) */}
          <div className="flex items-center gap-3 bg-gray-800 p-1.5 rounded-xl border border-gray-700">
            <span className="text-xs text-gray-400 font-medium px-2">Chế độ Demo:</span>
            <button 
              onClick={() => setRole('Customer')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${role === 'Customer' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Khách Hàng
            </button>
            <button 
              onClick={() => setRole('Admin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${role === 'Admin' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Hệ Thống
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {role === 'Customer' ? <CustomerView /> : <AdminView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6 text-center text-xs text-gray-500">
        <p>© 2026 Autohunt Car Selling System. Bài tập lớn bảo vệ môn Học phần Web / ReactJS.</p>
      </footer>
    </div>
  );
};