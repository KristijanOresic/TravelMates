import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
        <img
          src={`${process.env.PUBLIC_URL}/travelmateLogo.png`}
          alt="TravelMate Logo"
          className="logo"
        />
        <h1 className="app-title">TravelMate</h1>
        
        <button className="loginButton">Login</button>
      
      </div>
      </header>
    </div>
  );
}

export default App;
