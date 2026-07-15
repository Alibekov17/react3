// react hooks, fetch
import { useState, useEffect } from "react";

// 1. Компонент для собачки
const Card = () => {
  const [state, setState] = useState(0);
  const [dogimage, setDogImage] = useState("");

  useEffect(() => {
    fetch("https://api.thedogapi.com/v1/images/search?limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setDogImage(data[0].url);
        }
      })
      .catch((err) => console.error("Ошибка при загрузке собачки:", err));
  }, []);

  return (
    <div>
      <h3> Dog ({state})</h3>
      <button onClick={() => setState(state + 1)}>+</button>
      <button onClick={() => { if (state > 1) setState(state - 1); }}>-</button>
      <br />
      {dogimage && (
        <img style={{ width: "300px", height: "300px" }} src={dogimage} alt="dog" />
      )}
    </div>
  );
};

// 2. Компонент для медвежонка (переместили выше, чтобы App его видел!)
const App1 = () => {
  const [state, setState] = useState(0);
  const [bearImage, setBearImage] = useState("");

  useEffect(() => {
    fetch("https://placebear.com/g/300/300")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка сети");
        }
        return res.blob();
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setBearImage(imageUrl);
      })
      .catch((err) => console.error("Ошибка при загрузке медведя:", err));
  }, []);

  return (
    <div>
      <h3>Bear ({state})</h3>
      <button onClick={() => setState(state + 1)}>+</button>
      <button onClick={() => {
        if (state > 1) {
          setState(state - 1);
        }
      }}>-</button>
      <br />
      {bearImage && (
        <img 
          style={{ width: "300px", height: "300px",}} 
          src={bearImage} 
          alt="bear" 
        />
      )}
    </div>
  );
};

// 3. Главный компонент (Cat), рендерит всё остальное
const App = () => {
  const [state, setState] = useState(0);
  const [catimage, setCatImage] = useState("");

  useEffect(() => {
    fetch("https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCatImage(data[0].url);
        }
      })
      .catch((err) => console.error("Ошибка при загрузке котика:", err));
  }, []);

  return (
    <div>
      <div>
        <h3>Azadbek ( {state})</h3>
        <button onClick={() => setState(state + 1)}>+</button>
        <button onClick={() => { if (state > 1) setState(state - 1); }}>-</button>
        <br />
        {catimage && (
          <img style={{ width: "300px", height: "300px" }} src={catimage} alt="cat" />
        )}
      </div>

      <hr />

      {/* Вызываем компонент собачки */}
      <Card />

      <hr />
      
      {/* Теперь App1 определен выше и отрендерится без ошибок! */}
      <App1 />
    </div>
  );
};

// Экспортируем только один главный компонент
export default App;