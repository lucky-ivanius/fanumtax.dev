import ReactLenis from "lenis/react";

import Header from "./components/header";
import Accelerate from "./components/sections/accelerate";
import Developers from "./components/sections/developers";
import Funders from "./components/sections/funders";
import Hero from "./components/sections/hero";
import HowItWorks from "./components/sections/how-it-works";
import Ready from "./components/sections/ready";
import Trust from "./components/sections/trust";

const App: React.FC = () => {
  return (
    <>
      <ReactLenis root />
      <div className="min-h-screen">
        <Header />
        <Hero />
        <HowItWorks />
        <Developers />
        <Funders />
        <Accelerate />
        <Trust />
        <Ready />
      </div>
    </>
  );
};

export default App;
