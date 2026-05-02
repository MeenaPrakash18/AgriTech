import React from 'react';
import { useTranslation } from 'react-i18next';

function WaterSunlight({ weather }) {
  const { t } = useTranslation();

  const getRecommendations = () => {
    if (!weather) return null;

    let irrigation = "Standard watering schedule: Every 2-3 days early morning.";
    let shade = "No extra shade required currently.";
    let soilTip = "Add organic compost to maintain moisture.";

    if (weather.temperature > 35 && weather.humidity < 40) {
      irrigation = "Increase frequency: Daily deep watering recommended at dawn to prevent evaporation.";
      shade = "Consider 30% shade nets for sensitive crops (tomatoes, peppers) during peak afternoon hours.";
      soilTip = "Apply 2-inch organic mulch layer to retain soil moisture and lower root temperature.";
    } else if (weather.humidity > 80) {
      irrigation = "Decrease watering: Soil moisture is naturally high. Water only when top 2 inches feel dry.";
      shade = "Ensure maximum sunlight exposure. Prune dense canopies to improve airflow.";
      soilTip = "Ensure proper drainage to prevent root rot. Avoid over-watering.";
    }

    return { irrigation, shade, soilTip };
  };

  const recs = getRecommendations();

  return (
    <div className="card h-100 border-top border-primary border-4 shadow-sm pb-2">
      <div className="card-body p-4 d-flex flex-column">
        <h5 className="card-title text-primary mb-4">
          <i className="bi bi-droplet-half me-2"></i>{t('WaterSunlightTitle', 'Water & Sunlight Mgt')}
        </h5>

        {!weather ? (
          <div className="text-center mt-auto mb-auto py-3">
             <i className="bi bi-cloud-sun text-muted display-4 mb-3 d-block"></i>
             <p className="text-muted small mb-0">Waiting for location access to calculate water requirements.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mt-1">
            <div className="glass-panel p-3 border-primary border-opacity-25 bg-primary bg-opacity-10 position-relative">
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10 rounded-3"></div>
              <h6 className="text-info fw-bold mb-2 position-relative z-1"><i className="bi bi-moisture me-2"></i>Irrigation Schedule</h6>
              <p className="small text-white-50 mb-0 position-relative z-1">{recs.irrigation}</p>
            </div>

            <div className="glass-panel p-3 border-warning border-opacity-25 bg-warning bg-opacity-10 position-relative">
              <h6 className="text-warning fw-bold mb-2 position-relative z-1"><i className="bi bi-brightness-high me-2"></i>Sunlight & Shade</h6>
              <p className="small text-white-50 mb-0 position-relative z-1">{recs.shade}</p>
            </div>

            <div className="glass-panel p-3 border-success border-opacity-25 bg-success bg-opacity-10 position-relative">
              <h6 className="text-success fw-bold mb-2 position-relative z-1"><i className="bi bi-layers-half me-2"></i>Soil Preparation</h6>
              <p className="small text-white-50 mb-0 position-relative z-1">{recs.soilTip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaterSunlight;
