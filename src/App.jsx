import { useState, useEffect } from "react";
import "./App.css";

// Запасной список на случай сбоя API, чтобы породы собак и кошек гарантированно работали
const BACKUP_BREEDS = {
  cat: [
    { id: "sibe", name: "Сибирская кошка" },
    { id: "beng", name: "Бенгальская кошка" },
    { id: "siam", name: "Сиамская кошка" },
    { id: "pers", name: "Персидская кошка" },
    { id: "mcoo", name: "Мейн-кун" },
    { id: "sphx", name: "Сфинкс" }
  ],
  dog: [
    { id: "husky", name: "Сибирский хаски" },
    { id: "germanshepherd", name: "Немецкая овчарка" },
    { id: "labrador", name: "Лабрадор ретривер" },
    { id: "golden", name: "Золотистый ретривер" },
    { id: "pug", name: "Мопс" },
    { id: "bulldog", name: "Французский бульдог" }
  ]
};

const App = () => {
  const [state, setState] = useState(0);
  const [petType, setPetType] = useState("cat"); // 'cat' или 'dog'
  const [breedsList, setBreedsList] = useState([]); // Названия пород
  const [selectedBreed, setSelectedBreed] = useState(""); // Выбранная порода
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Вспомогательная функция для установки резервных пород
  const useBackupBreeds = (type) => {
    const backup = BACKUP_BREEDS[type];
    setBreedsList(backup);
    if (backup.length > 0) {
      setSelectedBreed(backup[0].id);
    }
  };

  // 1. Загрузка списка пород
  useEffect(() => {
    let isMounted = true; // Защита от race conditions (быстрых кликов)
    setLoading(true);
    setImage(""); 
    setSelectedBreed(""); 
    setBreedsList([]); 

    const url =
      petType === "cat"
        ? "https://api.thecatapi.com/v1/breeds"
        : "https://api.thedogapi.com/v1/breeds";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сервера при получении пород");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        // Фильтруем породы, у которых есть картинки
        const validBreeds = data.filter(b => b.reference_image_id || b.image?.url);
        
        if (validBreeds.length > 0) {
          setBreedsList(validBreeds);
          setSelectedBreed(validBreeds[0].id);
        } else {
          useBackupBreeds(petType);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("API временно недоступно, переключаемся на резервный список пород:", err);
        useBackupBreeds(petType);
      });

    return () => {
      isMounted = false;
    };
  }, [petType]);

  // 2. Функция для загрузки конкретной картинки
  const fetchSingleImage = () => {
    if (!selectedBreed) return;
    setLoading(true);

    const url =
      petType === "cat"
        ? `https://api.thecatapi.com/v1/images/search?breed_ids=${selectedBreed}`
        : `https://api.thedogapi.com/v1/images/search?breed_ids=${selectedBreed}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сети при загрузке фото");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setImage(data[0].url);
        } else {
          // Если картинок в поиске нет, пытаемся достать стандартную картинку из breedsList
          const currentBreed = breedsList.find(b => b.id === selectedBreed);
          if (currentBreed && currentBreed.image?.url) {
            setImage(currentBreed.image.url);
          } else {
            // Резервный запрос случайного фото
            const fallbackUrl = petType === "cat" 
              ? `https://api.thecatapi.com/v1/images/search` 
              : `https://api.thedogapi.com/v1/images/search`;
            
            fetch(fallbackUrl)
              .then(res => res.json())
              .then(fallbackData => {
                if (fallbackData && fallbackData.length > 0) {
                  setImage(fallbackData[0].url);
                }
              })
              .catch(err => console.error("Запасной запрос не удался:", err));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки фото:", err);
        setLoading(false);
      });
  };

  // Вызываем загрузку картинки только тогда, когда selectedBreed действительно существует
  useEffect(() => {
    if (selectedBreed) {
      fetchSingleImage();
    }
  }, [selectedBreed]);

  return (
    <div className="app-container">
      {/* Хеадер со счетчиком Azadbek */}
      <header className="app-header">
        <h1>Выбор животного 🐾</h1>
       
      </header>

      <main className="app-main">
        {/* Кнопки переключения */}
        <div className="toggle-buttons">
          <button 
            className={`btn-toggle cat-btn ${petType === "cat" ? "active" : ""}`}
            onClick={() => setPetType("cat")}
          >
            🐱 Кошка
          </button>
          <button 
            className={`btn-toggle dog-btn ${petType === "dog" ? "active" : ""}`}
            onClick={() => setPetType("dog")}
          >
            🐶 Собака
          </button>
        </div>

        {/* Выпадающий список пород */}
        <div className="breed-select-container">
          <label htmlFor="breed-dropdown">
            Выберите {petType === "cat" ? "кошку" : "собаку"}:{" "}
          </label>
          <select 
            id="breed-dropdown"
            value={selectedBreed} 
            onChange={(e) => setSelectedBreed(e.target.value)}
            className="breed-select"
          >
            {breedsList.map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопка смены фото */}
        <div className="refresh-container">
          <button className="btn-refresh" onClick={fetchSingleImage} disabled={loading || !selectedBreed}>
            🔄 Показать другую фотографию
          </button>
        </div>

        {/* Карточка отображения */}
        <div className="image-card">
          {loading ? (
            <div className="loader">Загрузка... 🔎</div>
          ) : image ? (
            <img className="pet-image" src={image} alt="pet" />
          ) : (
            <div className="loader">Фото не найдено. Выберите другую породу.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;