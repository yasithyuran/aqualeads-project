import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Header from './component/Header';
import HomePage from './component/HomePage';
import Education from './component/Education';
import Conservation from './component/Conservation';
import Interior from './component/Interior';
import Contact from './component/Contact';
import Ariums from './component/Ariums';
import Aquariums from './component/Aquariums'; 
import Freshwater from './component/freshwater';
import Planted from './component/planted';
import Aquascaping from './component/aquascaping';
import Lowt from './component/Lowt';
import Hight from './component/Hight';
import Livestock from './component/livestock';
import Access from './component/access';
import ArticleDetail from './component/ArticleDetail';
import ImportExport from './component/ImportExport'; 
import Products from './component/Products'; 
import Plants from './component/Plants';   
import Fish from './component/Fish';  
import Hardscape from './component/hardscape';  
import Lights from './component/lights';
import Filters from './component/filters';
import Equipment from './component/equipment';
import Paludarium from './component/Paludarium';
import Terrarium from './component/Terrarium';
import Vivarium from './component/Vivarium';
import Pond from './component/Pond';
import Landscape from './component/Landscape';
import Scenarium from './component/Scenarium';
import Marine from './component/Marine';
import Biotope from './component/Biotope';
import Zero from './component/Zero';
import Highm from './component/Highm';
import Lowm from './component/Lowm';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Ariums" element={<Ariums />} />
            <Route path="/education" element={<Education />} />
            <Route path="/conservation" element={<Conservation />} />
            <Route path="/Interior" element={<Interior />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/Aquariums" element={<Aquariums />} />
            <Route path="/freshwater" element={<Freshwater />} />
            <Route path="/planted" element={<Planted />} />
            <Route path="/aquascaping" element={<Aquascaping />} />
            <Route path="/lowt" element={<Lowt />} />
            <Route path="/hight" element={<Hight />} />
            <Route path="/livestock" element={<Livestock />} />
            <Route path="/access" element={<Access />} />
            <Route path="/Products" element={<Products />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/fish" element={<Fish />} />
            <Route path="/hardscape" element={<Hardscape />} />
            <Route path="/lights" element={<Lights />} />
            <Route path="/filters" element={<Filters />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/paludarium" element={<Paludarium />} />
            <Route path="/terrarium" element={<Terrarium />} />
            <Route path="/vivarium" element={<Vivarium />} />
            <Route path="/pond" element={<Pond />} />
            <Route path="/landscape" element={<Landscape />} />
            <Route path="/scenarium" element={<Scenarium />} />
            <Route path="/marine" element={<Marine />} />
            <Route path="/biotope" element={<Biotope />} />
            <Route path="/zero" element={<Zero />} />
            <Route path="/highm" element={<Highm />} />
            <Route path="/lowm" element={<Lowm />} />
            
            {/* Import/Export route */}
            <Route path="/importexport" element={<ImportExport />} />

            {/* Article detail routes */}
            <Route path="/education/:id" element={<ArticleDetail />} />
            <Route path="/conservation/:id" element={<ArticleDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;