import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles.css";

const API = "http://localhost:3000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("12345678");
  const [inventory, setInventory] = useState([]);
  const [events, setEvents] = useState([]);
  const [orderForm, setOrderForm] = useState({
    productVariationId: 1,
    quantity: 1,
    countryCode: "EG",
  });
  const [message, setMessage] = useState("");

  const tokenRef = useRef(token);

  // Load inventory data
  const loadInventory = async (t) => {
    try {
      const res = await axios.get(`${API}/inventory`, {
        headers: { Authorization: `Bearer ${t || tokenRef.current}` },
      });

      setInventory(res.data.data);
    } catch {
      setMessage("Error loading inventory");
    }
  };

  // Login function
  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });

      const t = res.data.data.accessToken;

      setToken(t);
      tokenRef.current = t;
      localStorage.setItem("token", t);

      setMessage("Login successful");
      loadInventory(t);
    } catch (e) {
      setMessage("Login error");
    }
  };

  // Create order function
  const createOrder = async () => {
    try {
      await axios.post(`${API}/orders`, orderForm, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });

      setMessage("Order created");
    } catch (e) {
      setMessage("Error creating order");
    }
  };

  // Set up Server-Sent Events (SSE) for real-time updates
  useEffect(() => {
    const es = new EventSource(`${API}/inventory/events`);

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);

      // Keep latest 20 events
      setEvents((prev) =>
        [{ ...event, time: new Date().toLocaleTimeString() }, ...prev].slice(
          0,
          20
        )
      );

      // Update inventory if stock changed
      if (event.type === "stock.updated") loadInventory();
    };

    return () => es.close();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Ecommerce Event Demo</h1>

      <div className="grid">
        {/* LOGIN CARD */}
        <div className="card">
          <h2>Login</h2>

          <div className="form">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />

            <button onClick={login}>Login</button>

            {token && <span className="badge success">Authenticated</span>}
          </div>
        </div>

        {/* CREATE ORDER CARD */}
        <div className="card">
          <h2>Create Order</h2>

          <div className="form-row">
            <input
              type="number"
              value={orderForm.productVariationId}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  productVariationId: +e.target.value,
                })
              }
            />

            <input
              type="number"
              value={orderForm.quantity}
              onChange={(e) =>
                setOrderForm({ ...orderForm, quantity: +e.target.value })
              }
            />

            <input
              value={orderForm.countryCode}
              onChange={(e) =>
                setOrderForm({ ...orderForm, countryCode: e.target.value })
              }
            />
          </div>

          <button onClick={createOrder} disabled={!token}>
            Create Order
          </button>
        </div>
      </div>

      {/* MESSAGE ALERT */}
      {message && <div className="alert">{message}</div>}

      {/* INVENTORY CARD */}
      <div className="card">
        <div className="card-header">
          <h2>Inventory</h2>
          <button onClick={() => loadInventory()}>Refresh</button>
        </div>

        {inventory.length === 0 ? (
          <p className="muted">No data — please login first</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Variation</th>
                <th>Country</th>
                <th>Stock</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((i) => (
                <tr key={i.id} className={i.quantity < 5 ? "low-stock" : ""}>
                  <td>{i.id}</td>
                  <td>{i.productVariationId}</td>
                  <td>{i.countryCode}</td>
                  <td>
                    {i.quantity}
                    {i.quantity < 5 && (
                      <span className="badge danger">LOW</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* REAL-TIME EVENTS CARD */}
      <div className="card">
        <h2>Real-Time Events</h2>

        {events.length === 0 ? (
          <p className="muted">Waiting for events...</p>
        ) : (
          events.map((e, i) => (
            <div
              key={i}
              className={`event ${
                e.type === "inventory.low_stock" ? "event-danger" : "event-ok"
              }`}
            >
              <div className="event-header">
                [{e.time}] {e.type}
              </div>

              <pre>{JSON.stringify(e.data, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
