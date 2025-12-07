import React, { useState, useEffect } from 'react';
import { Home, Calculator, BarChart3, User, TrendingDown, TrendingUp, Leaf, Zap } from 'lucide-react';

const EMISSION_FACTORS = {
  transport: { car: 0.192, bus: 0.089, metro: 0.041 },
  energy: { low: 0.5, medium: 1.2, high: 2.0 },
  food: { vegan: 1.5, vegetarian: 2.5, balanced: 3.5, meatHeavy: 5.0 },
  waste: { recycles: 0.3, partial: 0.8, noRecycle: 1.5 }
};

function calculateImpact(data) {
  const transport = (data.carKm * EMISSION_FACTORS.transport.car) + 
                   (data.busKm * EMISSION_FACTORS.transport.bus) + 
                   (data.metroKm * EMISSION_FACTORS.transport.metro);
  const energy = EMISSION_FACTORS.energy[data.energyLevel];
  const food = EMISSION_FACTORS.food[data.diet];
  const waste = EMISSION_FACTORS.waste[data.recycling];
  
  const total = transport + energy + food + waste;
  const breakdown = {
    transport: parseFloat(transport.toFixed(2)),
    energy: parseFloat(energy.toFixed(2)),
    food: parseFloat(food.toFixed(2)),
    waste: parseFloat(waste.toFixed(2))
  };
  
  const villain = Object.entries(breakdown).reduce((max, [k, v]) => 
    v > max.value ? { category: k, value: v } : max, 
    { category: 'transport', value: 0 }
  );
  
  return {
    total: parseFloat(total.toFixed(2)),
    breakdown,
    villain: villain.category,
    level: total < 5 ? 'low' : total < 10 ? 'medium' : 'high'
  };
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('mih_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveResult = (result) => {
    const entry = { id: Date.now(), date: new Date().toISOString(), ...result };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    localStorage.setItem('mih_history', JSON.stringify(newHistory));
    setView('dashboard');
  };

  return (
    <div className="app-container">
      <style>{styles}</style>
      
      <header className="header">
        <div className="header-content">
          <div className="header-icon">🌱</div>
          <div>
            <h1 className="header-title">Meu Impacto Hoje</h1>
            <p className="header-subtitle">Calculadora de Pegada de Carbono</p>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        {view === 'dashboard' && <Dashboard history={history} />}
        {view === 'calculator' && <CalculatorView onSave={saveResult} />}
        {view === 'history' && <HistoryView history={history} />}
        {view === 'profile' && <ProfileView onClear={() => {
          if (window.confirm('Deseja realmente limpar todos os dados?')) {
            localStorage.removeItem('mih_history');
            setHistory([]);
          }
        }} />}
      </main>
      
      <nav className="menu-inferior">
        {[
          { id: 'dashboard', icon: Home, label: 'Início' },
          { id: 'calculator', icon: Calculator, label: 'Calcular' },
          { id: 'history', icon: BarChart3, label: 'Histórico' },
          { id: 'profile', icon: User, label: 'Perfil' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={view === item.id ? 'menu-item active' : 'menu-item'}
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Dashboard({ history }) {
  const latest = history[history.length - 1];
  const week = history.slice(-7);
  const avg = week.length > 0 ? (week.reduce((s, e) => s + e.total, 0) / week.length).toFixed(2) : 0;
  
  const monthData = history.slice(-30);
  const monthAvg = monthData.length > 0 ? (monthData.reduce((s, e) => s + e.total, 0) / monthData.length).toFixed(2) : 0;
  
  const getTrend = () => {
    if (history.length < 2) return null;
    const recent = history.slice(-7);
    const previous = history.slice(-14, -7);
    if (previous.length === 0) return null;
    
    const recentAvg = recent.reduce((s, e) => s + e.total, 0) / recent.length;
    const prevAvg = previous.reduce((s, e) => s + e.total, 0) / previous.length;
    
    return recentAvg < prevAvg ? 'down' : 'up';
  };

  if (!latest) {
    return (
      <div className="fade-in">
        <h2 className="section-title">Visão Geral</h2>
        <div className="empty-state">
          <div className="empty-icon">
            <Calculator size={64} color="#cbd5e1" />
          </div>
          <h3 className="empty-title">Nenhum cálculo realizado</h3>
          <p className="empty-text">
            Comece agora medindo seu impacto ambiental diário. 
            Use a calculadora no menu abaixo para registrar suas atividades.
          </p>
          <div className="empty-tips">
            <div className="tip-item">
              <Leaf size={20} color="#16a34a" />
              <span>Acompanhe sua evolução</span>
            </div>
            <div className="tip-item">
              <Zap size={20} color="#16a34a" />
              <span>Identifique seus vilões</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const trend = getTrend();

  return (
    <div className="fade-in">
      <h2 className="section-title">Visão Geral</h2>
      
      <div className={'card-resultado resultado-' + latest.level}>
        <div className="resultado-header">
          <div className="label">Última Medição</div>
          <div className="resultado-date">{new Date(latest.date).toLocaleDateString('pt-BR')}</div>
        </div>
        <div className="value">{latest.total} kg</div>
        <div className="subtext">CO₂ equivalente hoje</div>
        <div className="resultado-nivel">
          {latest.level === 'low' && '🌱 Impacto Baixo'}
          {latest.level === 'medium' && '⚠️ Impacto Médio'}
          {latest.level === 'high' && '🔴 Impacto Alto'}
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Média Semanal</h3>
            {trend && (
              <div className={'trend-badge trend-' + trend}>
                {trend === 'down' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                {trend === 'down' ? 'Melhorando' : 'Aumentando'}
              </div>
            )}
          </div>
          <div className="big-number">{avg} kg</div>
          <p className="small-text">CO₂/dia • {week.length} medições</p>
        </div>
        
        {monthData.length > 0 && (
          <div className="metric-card">
            <h3>Média Mensal</h3>
            <div className="big-number secondary">{monthAvg} kg</div>
            <p className="small-text">CO₂/dia • {monthData.length} medições</p>
          </div>
        )}
      </div>
      
      <div className="card-data">
        <div className="card-header">
          <h3>🎯 Seu Vilão Principal</h3>
        </div>
        <div className="villain-section">
          <div className="villain-badge">
            {getVillainInfo(latest.villain).icon} {getVillainInfo(latest.villain).name}
          </div>
          <div className="villain-stats">
            <div className="villain-value">{latest.breakdown[latest.villain]} kg CO₂</div>
            <div className="villain-percent">
              {((latest.breakdown[latest.villain] / latest.total) * 100).toFixed(0)}% do total
            </div>
          </div>
        </div>
        <p className="small-text tip-text">
          💡 Foque em reduzir essa categoria para diminuir seu impacto geral
        </p>
      </div>
      
      <div className="card-data">
        <h3>📊 Breakdown por Categoria</h3>
        <div className="breakdown-list">
          {Object.entries(latest.breakdown).map(([cat, val]) => (
            <div key={cat} className="breakdown-item">
              <div className="breakdown-label">
                <span className="breakdown-icon">{getVillainInfo(cat).icon}</span>
                <span>{getVillainInfo(cat).name}</span>
              </div>
              <div className="breakdown-bar-container">
                <div 
                  className="breakdown-bar"
                  style={{ width: `${(val / latest.total) * 100}%` }}
                />
              </div>
              <div className="breakdown-value">{val} kg</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card-data equivalence-card">
        <h3>🌍 Equivalência</h3>
        <p className="small-text equivalence-intro">
          Seu impacto de hoje equivale a:
        </p>
        <div className="equivalence-grid">
          <div className="equiv-item">
            <div className="equiv-icon">🚗</div>
            <div className="equiv-value">{(latest.total / 0.192).toFixed(0)} km</div>
            <div className="equiv-label">dirigidos de carro</div>
          </div>
          <div className="equiv-item">
            <div className="equiv-icon">🌳</div>
            <div className="equiv-value">{(latest.total * 2.4).toFixed(0)}</div>
            <div className="equiv-label">árvores necessárias/ano</div>
          </div>
          <div className="equiv-item">
            <div className="equiv-icon">💡</div>
            <div className="equiv-value">{(latest.total * 0.83).toFixed(0)} h</div>
            <div className="equiv-label">de lâmpada acesa</div>
          </div>
          <div className="equiv-item">
            <div className="equiv-icon">📱</div>
            <div className="equiv-value">{(latest.total * 121).toFixed(0)}</div>
            <div className="equiv-label">cargas de celular</div>
          </div>
        </div>
      </div>
      
      <div className="tips-card">
        <h3>💚 Dicas para Reduzir</h3>
        <div className="tips-list">
          {latest.villain === 'transport' && (
            <div className="tip-box">Use transporte público ou bicicleta sempre que possível</div>
          )}
          {latest.villain === 'energy' && (
            <div className="tip-box">Desligue aparelhos da tomada e use iluminação natural</div>
          )}
          {latest.villain === 'food' && (
            <div className="tip-box">Reduza consumo de carne vermelha e escolha alimentos locais</div>
          )}
          {latest.villain === 'waste' && (
            <div className="tip-box">Separe seu lixo e priorize produtos reutilizáveis</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalculatorView({ onSave }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    carKm: 0, busKm: 0, metroKm: 0,
    energyLevel: 'medium', diet: 'balanced', recycling: 'partial'
  });

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fade-in">
      <div className="calculator-header">
        <h2 className="section-title">Calculadora de Impacto</h2>
        <div className="step-indicator">Passo {step} de 4</div>
      </div>
      
      <div className="progress-bar">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={i <= step ? 'segment active' : 'segment'}>
            <div className="segment-fill" />
          </div>
        ))}
      </div>
      
      <div className="wizard-content">
        {step === 1 && (
          <div className="step slide-in">
            <div className="step-header">
              <div className="step-icon">🚗</div>
              <div>
                <h2 className="step-title">Transporte</h2>
                <p className="step-subtitle">Quantos km você viajou hoje?</p>
              </div>
            </div>
            
            {[
              { key: 'car', label: 'Carro', icon: '🚗', tip: 'Maior emissor individual' },
              { key: 'bus', label: 'Ônibus', icon: '🚌', tip: 'Mais sustentável' },
              { key: 'metro', label: 'Metrô', icon: '🚇', tip: 'Menor emissão' }
            ].map(t => (
              <div key={t.key} className="input-group">
                <div className="input-header">
                  <label className="input-label">
                    {t.icon} {t.label}: <strong>{data[t.key + 'Km']} km</strong>
                  </label>
                  <span className="input-tip">{t.tip}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data[t.key + 'Km']}
                  onChange={e => update(t.key + 'Km', Number(e.target.value))}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>0 km</span>
                  <span>100 km</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {step === 2 && (
          <div className="step slide-in">
            <div className="step-header">
              <div className="step-icon">⚡</div>
              <div>
                <h2 className="step-title">Energia</h2>
                <p className="step-subtitle">Qual foi seu consumo de energia hoje?</p>
              </div>
            </div>
            
            {[
              { v: 'low', l: 'Baixo', d: 'Luzes apagadas, aparelhos desligados', impact: '0.5 kg CO₂' },
              { v: 'medium', l: 'Médio', d: 'Uso normal de eletrodomésticos', impact: '1.2 kg CO₂' },
              { v: 'high', l: 'Alto', d: 'Ar condicionado, muitos aparelhos ligados', impact: '2.0 kg CO₂' }
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => update('energyLevel', opt.v)}
                className={data.energyLevel === opt.v ? 'option-btn active' : 'option-btn'}
              >
                <div className="option-content">
                  <div>
                    <div className="opt-label">{opt.l}</div>
                    <div className="opt-desc">{opt.d}</div>
                  </div>
                  <div className="opt-impact">{opt.impact}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {step === 3 && (
          <div className="step slide-in">
            <div className="step-header">
              <div className="step-icon">🍽️</div>
              <div>
                <h2 className="step-title">Alimentação</h2>
                <p className="step-subtitle">Como foi sua dieta hoje?</p>
              </div>
            </div>
            
            {[
              { v: 'vegan', l: 'Vegano', d: 'Apenas vegetais e grãos', impact: '1.5 kg CO₂' },
              { v: 'vegetarian', l: 'Vegetariano', d: 'Sem carne, com laticínios', impact: '2.5 kg CO₂' },
              { v: 'balanced', l: 'Equilibrado', d: 'Pouca carne, mais vegetais', impact: '3.5 kg CO₂' },
              { v: 'meatHeavy', l: 'Rica em carne', d: 'Muita carne vermelha', impact: '5.0 kg CO₂' }
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => update('diet', opt.v)}
                className={data.diet === opt.v ? 'option-btn active' : 'option-btn'}
              >
                <div className="option-content">
                  <div>
                    <div className="opt-label">{opt.l}</div>
                    <div className="opt-desc">{opt.d}</div>
                  </div>
                  <div className="opt-impact">{opt.impact}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {step === 4 && (
          <div className="step slide-in">
            <div className="step-header">
              <div className="step-icon">♻️</div>
              <div>
                <h2 className="step-title">Resíduos</h2>
                <p className="step-subtitle">Como você tratou o lixo hoje?</p>
              </div>
            </div>
            
            {[
              { v: 'recycles', l: 'Reciclei tudo', d: 'Separação completa dos resíduos', impact: '0.3 kg CO₂' },
              { v: 'partial', l: 'Parcialmente', d: 'Alguma separação básica', impact: '0.8 kg CO₂' },
              { v: 'noRecycle', l: 'Não reciclei', d: 'Tudo misturado', impact: '1.5 kg CO₂' }
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => update('recycling', opt.v)}
                className={data.recycling === opt.v ? 'option-btn active' : 'option-btn'}
              >
                <div className="option-content">
                  <div>
                    <div className="opt-label">{opt.l}</div>
                    <div className="opt-desc">{opt.d}</div>
                  </div>
                  <div className="opt-impact">{opt.impact}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="wizard-buttons">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary">
            ← Voltar
          </button>
        )}
        {step < 4 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary">
            Próximo →
          </button>
        ) : (
          <button onClick={() => onSave(calculateImpact(data))} className="btn-primary">
            ✓ Calcular Impacto
          </button>
        )}
      </div>
    </div>
  );
}

function HistoryView({ history }) {
  const getStats = () => {
    if (history.length === 0) return null;
    const total = history.reduce((s, e) => s + e.total, 0);
    const avg = (total / history.length).toFixed(2);
    const lowest = Math.min(...history.map(e => e.total)).toFixed(2);
    const highest = Math.max(...history.map(e => e.total)).toFixed(2);
    return { total: total.toFixed(2), avg, lowest, highest };
  };

  const stats = getStats();

  return (
    <div className="fade-in">
      <h2 className="section-title">Histórico de Medições</h2>
      
      {history.length > 0 ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Acumulado</div>
              <div className="stat-value">{stats.total} kg</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Média Geral</div>
              <div className="stat-value">{stats.avg} kg</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Melhor Dia</div>
              <div className="stat-value success">{stats.lowest} kg</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pior Dia</div>
              <div className="stat-value danger">{stats.highest} kg</div>
            </div>
          </div>
          
          <div className="history-section">
            <h3 className="subsection-title">Todas as Medições ({history.length})</h3>
            <div className="history-list">
              {[...history].reverse().map(e => (
                <div key={e.id} className="history-item">
                  <div className="history-left">
                    <div className="history-date">
                      {new Date(e.date).toLocaleDateString('pt-BR', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </div>
                    <div className="history-villain">
                      {getVillainInfo(e.villain).icon} {getVillainInfo(e.villain).name}
                    </div>
                  </div>
                  <div className={'history-badge badge-' + e.level}>
                    <span className="badge-value">{e.total}</span>
                    <span className="badge-unit">kg CO₂</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <BarChart3 size={64} color="#cbd5e1" />
          <h3 className="empty-title">Nenhum histórico ainda</h3>
          <p className="empty-text">
            Suas medições aparecerão aqui assim que você começar a calcular seu impacto
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileView({ onClear }) {
  return (
    <div className="fade-in">
      <h2 className="section-title">Perfil e Configurações</h2>
      
      <div className="card-data">
        <div className="profile-section">
          <div className="profile-icon">🌱</div>
          <div>
            <h3>Sobre o Aplicativo</h3>
            <p className="profile-text">
              O <strong>Meu Impacto Hoje</strong> é uma ferramenta para você acompanhar e reduzir 
              sua pegada de carbono diária. Calcule, analise e tome ações para um futuro mais sustentável.
            </p>
          </div>
        </div>
      </div>
      
      <div className="card-data">
        <h3>📊 Metodologia de Cálculo</h3>
        <p className="profile-text">
          Usamos fatores de emissão médios globais:
        </p>
        <div className="methodology-list">
          <div className="method-item">
            <strong>Transporte:</strong> Carro 0.192 kg/km • Ônibus 0.089 kg/km • Metrô 0.041 kg/km
          </div>
          <div className="method-item">
            <strong>Energia:</strong> Baixo 0.5 kg • Médio 1.2 kg • Alto 2.0 kg
          </div>
          <div className="method-item">
            <strong>Alimentação:</strong> Vegano 1.5 kg • Vegetariano 2.5 kg • Equilibrado 3.5 kg • Carne 5.0 kg
          </div>
          <div className="method-item">
            <strong>Resíduos:</strong> Reciclado 0.3 kg • Parcial 0.8 kg • Não reciclado 1.5 kg
          </div>
        </div>
      </div>
      
      <div className="card-data">
        <h3>💾 Gerenciamento de Dados</h3>
        <p className="profile-text">
          Todos os seus dados são armazenados <strong>localmente no seu navegador</strong>. 
          Nenhuma informação é enviada para servidores externos.
        </p>
        <div className="data-info">
          <div className="info-badge">
            <span className="info-icon">🔒</span>
            <span>Privacidade total</span>
          </div>
          <div className="info-badge">
            <span className="info-icon">💾</span>
            <span>Armazenamento local</span>
          </div>
          <div className="info-badge">
            <span className="info-icon">⚡</span>
            <span>Acesso instantâneo</span>
          </div>
        </div>
        <button onClick={onClear} className="btn-danger">
          🗑️ Limpar Todos os Dados
        </button>
        <p className="warning-text">
          ⚠️ Esta ação não pode ser desfeita. Todo o seu histórico será permanentemente apagado.
        </p>
      </div>
      
      <div className="card-data footer-card">
        <p className="footer-text">
          Desenvolvido com 💚 para um planeta mais sustentável
        </p>
        <p className="version-text">v1.0.0 • 2024</p>
      </div>
    </div>
  );
}

function getVillainInfo(cat) {
  const info = {
    transport: { icon: '🚗', name: 'Transporte' },
    energy: { icon: '⚡', name: 'Energia' },
    food: { icon: '🍽️', name: 'Alimentação' },
    waste: { icon: '♻️', name: 'Resíduos' }
  };
  return info[cat] || info.transport;
}

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .app-container {
    max-width: 500px;
    margin: 0 auto;
    min-height: 100vh;
    background: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding-bottom: 80px;
  }
  
  .header {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
    padding: 24px 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .header-icon {
    font-size: 40px;
    line-height: 1;
  }
  
  .header-title { 
    font-size: 22px; 
    margin-bottom: 4px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  
  .header-subtitle { 
    font-size: 13px; 
    opacity: 0.95;
    font-weight: 400;
  }
  
  .main-content { padding: 16px; }
  
  .section-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #111827;
    letter-spacing: -0.5px;
  }
  
  .subsection-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #374151;
  }
  
  .fade-in {
    animation: fadeIn 0.4s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .card-resultado {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .resultado-low {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
  }
  
  .resultado-medium {
    background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
    color: #713f12;
  }
  
  .resultado-high {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
  }
  
  .resultado-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .resultado-date {
    font-size: 12px;
    opacity: 0.85;
    font-weight: 500;
  }
  
  .label { 
    font-size: 13px; 
    opacity: 0.85; 
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value { 
    font-size: 56px; 
    font-weight: 800; 
    margin: 12px 0;
    line-height: 1;
    letter-spacing: -2px;
  }
  
  .subtext { 
    font-size: 15px; 
    opacity: 0.85;
    margin-bottom: 8px;
  }
  
  .resultado-nivel {
    font-size: 14px;
    font-weight: 600;
    margin-top: 12px;
    padding: 8px 16px;
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    display: inline-block;
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .metric-card h3 {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .trend-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
  }
  
  .trend-down {
    background: #dcfce7;
    color: #166534;
  }
  
  .trend-up {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .big-number {
    font-size: 28px;
    font-weight: 700;
    color: #16a34a;
    margin: 4px 0;
    letter-spacing: -1px;
  }
  
  .big-number.secondary {
    color: #06b6d4;
  }
  
  .small-text {
    font-size: 12px;
    color: #6b7280;
    margin: 4px 0;
  }
  
  .card-data {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .card-data h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #111827;
  }
  
  .villain-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .villain-badge {
    display: inline-block;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    padding: 12px 20px;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 2px 8px rgba(250,204,21,0.3);
  }
  
  .villain-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f9fafb;
    border-radius: 12px;
  }
  
  .villain-value {
    font-size: 24px;
    font-weight: 700;
    color: #dc2626;
  }
  
  .villain-percent {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }
  
  .tip-text {
    margin-top: 12px;
    padding: 12px;
    background: #f0fdf4;
    border-left: 3px solid #16a34a;
    border-radius: 4px;
    color: #166534;
  }
  
  .breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .breakdown-item {
    display: grid;
    grid-template-columns: 100px 1fr 60px;
    align-items: center;
    gap: 12px;
  }
  
  .breakdown-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
  
  .breakdown-icon {
    font-size: 18px;
  }
  
  .breakdown-bar-container {
    height: 24px;
    background: #f3f4f6;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .breakdown-bar {
    height: 100%;
    background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
    transition: width 0.6s ease;
    border-radius: 12px;
  }
  
  .breakdown-value {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    text-align: right;
  }
  
  .equivalence-card {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }
  
  .equivalence-intro {
    margin-bottom: 16px;
    color: #0c4a6e;
    font-weight: 500;
  }
  
  .equivalence-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .equiv-item {
    text-align: center;
    padding: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .equiv-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .equiv-value {
    font-size: 24px;
    font-weight: 700;
    color: #0891b2;
    display: block;
    margin-bottom: 4px;
  }
  
  .equiv-label {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.3;
  }
  
  .tips-card {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .tips-card h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #166534;
  }
  
  .tip-box {
    padding: 12px 16px;
    background: white;
    border-left: 4px solid #16a34a;
    border-radius: 8px;
    font-size: 14px;
    color: #374151;
    line-height: 1.5;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .empty-state {
    text-align: center;
    padding: 48px 24px;
  }
  
  .empty-icon {
    margin-bottom: 16px;
  }
  
  .empty-title {
    font-size: 20px;
    color: #374151;
    margin: 16px 0 8px 0;
    font-weight: 600;
  }
  
  .empty-text {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 300px;
    margin: 0 auto 24px;
  }
  
  .empty-tips {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .tip-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
    font-weight: 500;
  }
  
  .calculator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .step-indicator {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    padding: 6px 12px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .progress-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }
  
  .progress-bar .segment {
    flex: 1;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }
  
  .progress-bar .segment.active {
    background: #16a34a;
  }
  
  .segment-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .wizard-content { 
    min-height: 420px;
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .step-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f3f4f6;
  }
  
  .step-icon {
    font-size: 40px;
    line-height: 1;
  }
  
  .step-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
    color: #111827;
    letter-spacing: -0.5px;
  }
  
  .step-subtitle {
    font-size: 14px;
    color: #6b7280;
    font-weight: 400;
  }
  
  .input-group {
    margin-bottom: 28px;
  }
  
  .input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .input-label {
    font-size: 15px;
    font-weight: 500;
    color: #374151;
  }
  
  .input-label strong {
    color: #16a34a;
    font-weight: 700;
  }
  
  .input-tip {
    font-size: 11px;
    color: #9ca3af;
    font-style: italic;
  }
  
  .slider {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: #e5e7eb;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #16a34a;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  .slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #16a34a;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 4px;
  }
  
  .option-btn {
    width: 100%;
    padding: 16px;
    margin-bottom: 12px;
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }
  
  .option-btn:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  }
  
  .option-btn.active {
    background: #dcfce7;
    border-color: #16a34a;
    box-shadow: 0 4px 12px rgba(22,163,74,0.2);
  }
  
  .option-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .opt-label {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
  }
  
  .opt-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }
  
  .opt-impact {
    font-size: 14px;
    font-weight: 700;
    color: #16a34a;
    padding: 6px 12px;
    background: white;
    border-radius: 8px;
  }
  
  .option-btn.active .opt-impact {
    background: #f0fdf4;
  }
  
  .wizard-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
  
  .btn-primary {
    flex: 1;
    padding: 16px;
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(22,163,74,0.3);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(22,163,74,0.4);
  }
  
  .btn-primary:active {
    transform: translateY(0);
  }
  
  .btn-secondary {
    flex: 1;
    padding: 16px;
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    text-align: center;
  }
  
  .stat-label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
  }
  
  .stat-value.success {
    color: #16a34a;
  }
  
  .stat-value.danger {
    color: #dc2626;
  }
  
  .history-section {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f9fafb;
    border-radius: 12px;
    transition: all 0.2s;
  }
  
  .history-item:hover {
    background: #f3f4f6;
    transform: translateX(4px);
  }
  
  .history-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .history-date {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-transform: capitalize;
  }
  
  .history-villain {
    font-size: 12px;
    color: #6b7280;
  }
  
  .history-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 8px 12px;
    border-radius: 12px;
    font-weight: 700;
  }
  
  .badge-value {
    font-size: 18px;
  }
  
  .badge-unit {
    font-size: 10px;
    opacity: 0.8;
  }
  
  .badge-low {
    background: #dcfce7;
    color: #166534;
  }
  
  .badge-medium {
    background: #fef3c7;
    color: #92400e;
  }
  
  .badge-high {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .profile-section {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  
  .profile-icon {
    font-size: 48px;
    line-height: 1;
  }
  
  .profile-text {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    margin: 8px 0 0 0;
  }
  
  .methodology-list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .method-item {
    padding: 10px 12px;
    background: #f9fafb;
    border-left: 3px solid #16a34a;
    border-radius: 4px;
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
  }
  
  .data-info {
    display: flex;
    gap: 8px;
    margin: 16px 0;
    flex-wrap: wrap;
  }
  
  .info-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #f0fdf4;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #166534;
  }
  
  .info-icon {
    font-size: 16px;
  }
  
  .btn-danger {
    width: 100%;
    padding: 14px;
    background: white;
    color: #dc2626;
    border: 2px solid #fecaca;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 16px;
    transition: all 0.2s;
  }
  
  .btn-danger:hover {
    background: #fef2f2;
    border-color: #fca5a5;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(220,38,38,0.2);
  }
  
  .warning-text {
    font-size: 12px;
    color: #dc2626;
    margin-top: 8px;
    text-align: center;
    font-weight: 500;
  }
  
  .footer-card {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    text-align: center;
  }
  
  .footer-text {
    font-size: 14px;
    color: #0c4a6e;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .version-text {
    font-size: 12px;
    color: #64748b;
  }
  
  .menu-inferior {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    max-width: 500px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 8px 0;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
    z-index: 100;
  }
  
  .menu-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    transition: all 0.2s;
  }
  
  .menu-item:hover {
    color: #6b7280;
  }
  
  .menu-item.active {
    color: #16a34a;
  }
  
  .menu-item span {
    font-size: 11px;
    margin-top: 4px;
    font-weight: 600;
  }
  
  @media (min-width: 768px) {
    .header-title { font-size: 26px; }
    .value { font-size: 64px; }
    .step-title { font-size: 28px; }
  }
`;