import React, { useState, useEffect } from 'react';
import { Home, Calculator, History, BookOpen, ChevronRight, Car, Utensils, Zap, Trash2, TrendingDown, Award, Leaf } from 'lucide-react';

// Fatores de emissão (kg CO2e)
const FATORES_EMISSAO = {
  transporte: {
    carro: 0.192,
    onibus: 0.074,
    bicicleta: 0,
    metro: 0.041,
    moto: 0.085
  },
  alimentacao: {
    vegana: 1.5,
    frango: 3.5,
    bovina: 6.5
  },
  energia: {
    chuveiro: 0.42, // por 15 min
    ar: 0.65, // por hora
    nenhum: 0
  },
  residuos: {
    zero: 0,
    poucos: 0.5,
    muitos: 1.2
  }
};

const App = () => {
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [etapaCalculo, setEtapaCalculo] = useState(0);
  const [dadosDia, setDadosDia] = useState({
    transporte: { km: 0, tipo: 'carro' },
    alimentacao: { tipo: 'frango' },
    energia: { tipo: 'nenhum', tempo: 0 },
    residuos: { quantidade: 'zero' }
  });
  const [resultado, setResultado] = useState(null);
  const [historico, setHistorico] = useState([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const hist = localStorage.getItem('historico');
    if (hist) setHistorico(JSON.parse(hist));
  }, []);

  const calcularPegada = () => {
    const emissaoTransporte = dadosDia.transporte.km * FATORES_EMISSAO.transporte[dadosDia.transporte.tipo];
    const emissaoAlimentacao = FATORES_EMISSAO.alimentacao[dadosDia.alimentacao.tipo];
    const emissaoEnergia = dadosDia.energia.tipo === 'chuveiro' 
      ? FATORES_EMISSAO.energia.chuveiro * (dadosDia.energia.tempo / 15)
      : dadosDia.energia.tipo === 'ar'
      ? FATORES_EMISSAO.energia.ar * dadosDia.energia.tempo
      : 0;
    const emissaoResiduos = FATORES_EMISSAO.residuos[dadosDia.residuos.quantidade];

    const total = emissaoTransporte + emissaoAlimentacao + emissaoEnergia + emissaoResiduos;
    
    const maiores = [
      { nome: 'Transporte', valor: emissaoTransporte },
      { nome: 'Alimentação', valor: emissaoAlimentacao },
      { nome: 'Energia', valor: emissaoEnergia },
      { nome: 'Resíduos', valor: emissaoResiduos }
    ].sort((a, b) => b.valor - a.valor);

    const novoResultado = {
      total: total.toFixed(2),
      detalhes: { emissaoTransporte, emissaoAlimentacao, emissaoEnergia, emissaoResiduos },
      maiorVilao: maiores[0].nome,
      data: new Date().toLocaleDateString('pt-BR')
    };

    setResultado(novoResultado);
    
    const novoHistorico = [...historico, novoResultado];
    setHistorico(novoHistorico);
    localStorage.setItem('historico', JSON.stringify(novoHistorico));
    
    setTelaAtiva('resultado');
  };

  const getDica = (vilao) => {
    const dicas = {
      'Transporte': 'Amanhã, tente compartilhar a viagem ou usar o transporte público para o percurso de maior impacto.',
      'Alimentação': 'Que tal reduzir o consumo de carne vermelha? Uma refeição vegetariana pode reduzir até 70% das emissões.',
      'Energia': 'Reduza o tempo no chuveiro elétrico ou ajuste o ar-condicionado para 23-24°C.',
      'Resíduos': 'Use sua própria garrafa e sacola reutilizável para diminuir o uso de descartáveis.'
    };
    return dicas[vilao];
  };

  const getCorResultado = (total) => {
    if (total < 5) return 'bg-green-500';
    if (total < 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const resetarCalculo = () => {
    setEtapaCalculo(0);
    setDadosDia({
      transporte: { km: 0, tipo: 'carro' },
      alimentacao: { tipo: 'frango' },
      energia: { tipo: 'nenhum', tempo: 0 },
      residuos: { quantidade: 'zero' }
    });
    setResultado(null);
  };

  // Dashboard
  const Dashboard = () => {
    const mediaSemanal = historico.length > 0 
      ? (historico.slice(-7).reduce((acc, h) => acc + parseFloat(h.total), 0) / Math.min(7, historico.length)).toFixed(2)
      : 0;

    return (
      <div className="p-6 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">Meu Impacto Hoje</h1>
          <p className="text-gray-600">Calcule sua pegada de carbono diária</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Média Semanal</p>
              <p className="text-4xl font-bold text-green-700">{mediaSemanal}</p>
              <p className="text-sm text-gray-500">kg CO₂e/dia</p>
            </div>
            <Leaf className="w-16 h-16 text-green-500 opacity-50" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingDown className="w-4 h-4" />
            <span>Continue assim! Cada ação conta.</span>
          </div>
        </div>

        <button
          onClick={() => { resetarCalculo(); setTelaAtiva('calculadora'); }}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Calculator className="w-6 h-6" />
          Calcular Impacto de Hoje
          <ChevronRight className="w-5 h-5" />
        </button>

        {historico.length > 0 && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow">
            <h3 className="font-semibold text-gray-700 mb-3">Último Registro</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{historico[historico.length - 1].data}</span>
              <span className="text-2xl font-bold text-green-700">
                {historico[historico.length - 1].total} kg CO₂e
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculadora
  const Calculadora = () => {
    const etapas = [
      {
        titulo: '🚗 Transporte',
        icone: Car,
        conteudo: (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-3 font-medium">Quantos KM você percorreu hoje?</label>
              <input
                type="range"
                min="0"
                max="100"
                value={dadosDia.transporte.km}
                onChange={(e) => setDadosDia({...dadosDia, transporte: {...dadosDia.transporte, km: e.target.value}})}
                className="w-full"
              />
              <p className="text-center text-3xl font-bold text-green-700 mt-2">{dadosDia.transporte.km} km</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-3 font-medium">Qual foi o meio principal?</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { valor: 'carro', label: 'Carro' },
                  { valor: 'onibus', label: 'Ônibus' },
                  { valor: 'bicicleta', label: 'Bicicleta/A pé' },
                  { valor: 'metro', label: 'Metrô/Trem' },
                  { valor: 'moto', label: 'Moto' }
                ].map(tipo => (
                  <button
                    key={tipo.valor}
                    onClick={() => setDadosDia({...dadosDia, transporte: {...dadosDia.transporte, tipo: tipo.valor}})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      dadosDia.transporte.tipo === tipo.valor 
                        ? 'border-green-600 bg-green-50 font-semibold' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {tipo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        titulo: '🍽️ Alimentação',
        icone: Utensils,
        conteudo: (
          <div>
            <label className="block text-gray-700 mb-4 font-medium">Qual foi o tipo de proteína dominante na sua refeição principal?</label>
            <div className="space-y-3">
              {[
                { valor: 'vegana', label: 'Vegana/Vegetariana', impacto: 'Baixo impacto' },
                { valor: 'frango', label: 'Frango/Peixe', impacto: 'Impacto médio' },
                { valor: 'bovina', label: 'Carne Bovina/Laticínios', impacto: 'Alto impacto' }
              ].map(tipo => (
                <button
                  key={tipo.valor}
                  onClick={() => setDadosDia({...dadosDia, alimentacao: {tipo: tipo.valor}})}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    dadosDia.alimentacao.tipo === tipo.valor 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold">{tipo.label}</div>
                  <div className="text-sm text-gray-500">{tipo.impacto}</div>
                </button>
              ))}
            </div>
          </div>
        )
      },
      {
        titulo: '💡 Energia',
        icone: Zap,
        conteudo: (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-3 font-medium">Você utilizou equipamentos de alto consumo hoje?</label>
              <div className="space-y-3">
                {[
                  { valor: 'chuveiro', label: 'Chuveiro Elétrico' },
                  { valor: 'ar', label: 'Ar Condicionado' },
                  { valor: 'nenhum', label: 'Nenhum' }
                ].map(tipo => (
                  <button
                    key={tipo.valor}
                    onClick={() => setDadosDia({...dadosDia, energia: {tipo: tipo.valor, tempo: 0}})}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      dadosDia.energia.tipo === tipo.valor 
                        ? 'border-green-600 bg-green-50 font-semibold' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {tipo.label}
                  </button>
                ))}
              </div>
            </div>
            
            {dadosDia.energia.tipo !== 'nenhum' && (
              <div>
                <label className="block text-gray-700 mb-3 font-medium">
                  Por quanto tempo? {dadosDia.energia.tipo === 'chuveiro' ? '(minutos)' : '(horas)'}
                </label>
                <input
                  type="range"
                  min="0"
                  max={dadosDia.energia.tipo === 'chuveiro' ? '60' : '12'}
                  value={dadosDia.energia.tempo}
                  onChange={(e) => setDadosDia({...dadosDia, energia: {...dadosDia.energia, tempo: e.target.value}})}
                  className="w-full"
                />
                <p className="text-center text-3xl font-bold text-green-700 mt-2">
                  {dadosDia.energia.tempo} {dadosDia.energia.tipo === 'chuveiro' ? 'min' : 'h'}
                </p>
              </div>
            )}
          </div>
        )
      },
      {
        titulo: '🗑️ Resíduos',
        icone: Trash2,
        conteudo: (
          <div>
            <label className="block text-gray-700 mb-4 font-medium">Quantos itens de uso único você descartou hoje?</label>
            <div className="space-y-3">
              {[
                { valor: 'zero', label: '0 itens', desc: 'Parabéns!' },
                { valor: 'poucos', label: '1-3 itens', desc: 'Copos, embalagens, etc.' },
                { valor: 'muitos', label: 'Mais de 3 itens', desc: 'Tente reduzir' }
              ].map(tipo => (
                <button
                  key={tipo.valor}
                  onClick={() => setDadosDia({...dadosDia, residuos: {quantidade: tipo.valor}})}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    dadosDia.residuos.quantidade === tipo.valor 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold">{tipo.label}</div>
                  <div className="text-sm text-gray-500">{tipo.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )
      }
    ];

    const etapaAtual = etapas[etapaCalculo];
    const Icone = etapaAtual.icone;

    return (
      <div className="p-6 pb-24">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Icone className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">{etapaAtual.titulo}</h2>
          </div>
          <div className="flex gap-2 mb-6">
            {etapas.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 flex-1 rounded-full ${idx <= etapaCalculo ? 'bg-green-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          {etapaAtual.conteudo}
        </div>

        <div className="flex gap-3">
          {etapaCalculo > 0 && (
            <button
              onClick={() => setEtapaCalculo(etapaCalculo - 1)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
          )}
          {etapaCalculo < etapas.length - 1 ? (
            <button
              onClick={() => setEtapaCalculo(etapaCalculo + 1)}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              Próximo
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={calcularPegada}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Calcular Impacto
            </button>
          )}
        </div>
      </div>
    );
  };

  // Resultado
  const Resultado = () => {
    if (!resultado) return null;

    const arvores = (resultado.total / 22).toFixed(1);
    const kmEquivalente = (resultado.total / 0.192).toFixed(0);

    return (
      <div className="p-6 pb-24">
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu Impacto de Hoje</h2>
          <p className="text-gray-600">{resultado.data}</p>
        </div>

        <div className={`${getCorResultado(resultado.total)} text-white rounded-2xl p-8 mb-6 shadow-lg`}>
          <p className="text-lg mb-2 opacity-90">Total de Emissões</p>
          <p className="text-5xl font-bold mb-2">{resultado.total}</p>
          <p className="text-xl">kg CO₂e</p>
        </div>

        <div className="bg-cyan-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Equivalências</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-cyan-600 mt-1" />
              <p className="text-gray-700">Equivale a rodar <strong>{kmEquivalente} km</strong> de carro</p>
            </div>
            <div className="flex items-start gap-3">
              <Leaf className="w-5 h-5 text-cyan-600 mt-1" />
              <p className="text-gray-700">São necessárias <strong>{arvores} árvores</strong> para absorver isso em um dia</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Dica Personalizada
          </h3>
          <p className="text-gray-700 leading-relaxed">{getDica(resultado.maiorVilao)}</p>
        </div>

        <button
          onClick={() => setTelaAtiva('dashboard')}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    );
  };

  // Histórico
  const Historico = () => {
    const viloes = historico.length > 0 ? (() => {
      const totais = { Transporte: 0, Alimentação: 0, Energia: 0, Resíduos: 0 };
      historico.forEach(h => {
        totais.Transporte += h.detalhes.emissaoTransporte;
        totais.Alimentação += h.detalhes.emissaoAlimentacao;
        totais.Energia += h.detalhes.emissaoEnergia;
        totais.Resíduos += h.detalhes.emissaoResiduos;
      });
      return Object.entries(totais).sort((a, b) => b[1] - a[1]);
    })() : [];

    return (
      <div className="p-6 pb-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Minha História</h2>

        {historico.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum registro ainda. Comece calculando seu impacto!</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl p-6 shadow mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Ranking dos Vilões</h3>
              <div className="space-y-3">
                {viloes.map(([nome, valor], idx) => (
                  <div key={nome} className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400 w-8">{idx + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">{nome}</span>
                        <span className="text-sm text-gray-600">{valor.toFixed(2)} kg</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{width: `${(valor / viloes[0][1]) * 100}%`}}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-semibold text-gray-800 mb-4">Últimos Registros</h3>
              <div className="space-y-3">
                {historico.slice(-7).reverse().map((h, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{h.data}</span>
                    <span className="font-bold text-green-700">{h.total} kg CO₂e</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Recursos
  const Recursos = () => (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recursos Educacionais</h2>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold text-green-700 mb-3">O que é CO₂e?</h3>
          <p className="text-gray-700 leading-relaxed">
            CO₂e (dióxido de carbono equivalente) é uma medida que padroniza o impacto climático de diferentes gases de efeito estufa em termos de CO₂.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold text-green-700 mb-3">Pegada de Carbono</h3>
          <p className="text-gray-700 leading-relaxed">
            É o total de emissões de gases de efeito estufa causadas direta e indiretamente por uma pessoa, organização ou produto.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold text-green-700 mb-3">Dicas Rápidas</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Prefira transporte público ou bicicleta</li>
            <li>• Reduza o consumo de carne vermelha</li>
            <li>• Evite banhos longos com chuveiro elétrico</li>
            <li>• Use menos descartáveis</li>
            <li>• Desligue aparelhos da tomada</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-xl p-6 shadow">
          <h3 className="font-semibold text-green-700 mb-3">ODS Relacionados</h3>
          <p className="text-gray-700 leading-relaxed">
            Este projeto contribui para os Objetivos de Desenvolvimento Sustentável da ONU, especialmente o ODS 13 (Ação contra a mudança global do clima) e ODS 12 (Consumo e produção responsáveis).
          </p>
        </div>
      </div>
    </div>
  );

  // Menu Inferior
  const MenuInferior = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-3 max-w-lg mx-auto">
        {[
          { id: 'dashboard', icon: Home, label: 'Início' },
          { id: 'calculadora', icon: Calculator, label: 'Calcular' },
          { id: 'historico', icon: History, label: 'Histórico' },
          { id: 'recursos', icon: BookOpen, label: 'Recursos' }
        ].map(item => {
          const Icon = item.icon;
          const ativo = telaAtiva === item.id || (telaAtiva === 'resultado' && item.id === 'calculadora');
          return (
            <button
              key={item.id}
              onClick={() => { 
                if (item.id === 'calculadora') resetarCalculo();
                setTelaAtiva(item.id);
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                ativo ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${ativo ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-lg mx-auto">
      {telaAtiva === 'dashboard' && <Dashboard />}
      {telaAtiva === 'calculadora' && <Calculadora />}
      {telaAtiva === 'resultado' && <Resultado />}
      {telaAtiva === 'historico' && <Historico />}
      {telaAtiva === 'recursos' && <Recursos />}
      <MenuInferior />
    </div>
  );
};

export default App;