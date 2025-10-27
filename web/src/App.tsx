import "./App.css";
import Header from "./components/header/header";

function App() {
  return (
    <div className="w-full flex-col">
      <Header />
      {Array.from({ length: 40 }, () => Math.floor(Math.random() * 40)).map(
        (elem) => (
          <div key={elem} className="font-bold my-5">
            <h3>Just a text</h3>
          </div>
        )
      )}
    </div>
  );
}

export default App;
