import React from "react";
import "./Work.css";
import { workData } from "../data/data";

const Work = () => {
  return (
    <div className="work-container">
      <div className="work-section">
        {workData.map((categoryData, index) => (
          <div className="work-category" key={index}>
            <div className="work-gallery">
              {categoryData.images.map((image, idx) => (
                <div className="work-item" key={idx}>
                  <img src={image} alt={`Work ${idx + 1}`} />
                  {image === categoryData.shortImage && (
                    <h2 className="category-title">{categoryData.category}</h2>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Work;
