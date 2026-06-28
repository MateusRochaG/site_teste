import React, { useState, useMemo, useEffect } from "react";
import {
  Phone,
  MapPin,
  Clock,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  ChevronRight,
  Soup,
  Drumstick,
  Beef,
  ChefHat,
  Fish,
  Salad,
  Wheat,
  CookingPot,
  GlassWater,
  Wine,
  Cookie,
  ImageOff,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { supabase } from "./supabaseClient";

// Ícone + cor de apoio para cada categoria. Usado como "foto provisória"
// enquanto o restaurante não tem fotos reais dos pratos.
const CATEGORIA_VISUAL = {
  Entrada: { icon: UtensilsCrossed, bg: "#FBF3DE", fg: "#A8201A" },
  Sopa: { icon: Soup, bg: "#FBF3DE", fg: "#A8201A" },
  Frango: { icon: Drumstick, bg: "#FCEFD1", fg: "#C9A227" },
  "Filet Mignon": { icon: Beef, bg: "#F6DEDB", fg: "#A8201A" },
  "Filet de Frango": { icon: Drumstick, bg: "#FCEFD1", fg: "#C9A227" },
  Guarnições: { icon: Wheat, bg: "#FCEFD1", fg: "#C9A227" },
  "Comida Chinesa": { icon: CookingPot, bg: "#F6DEDB", fg: "#A8201A" },
  "Carne de Boi": { icon: Beef, bg: "#F6DEDB", fg: "#A8201A" },
  "Carne de Porco": { icon: ChefHat, bg: "#F6DEDB", fg: "#A8201A" },
  Peixe: { icon: Fish, bg: "#E3EFE9", fg: "#2F6F5E" },
  Legumes: { icon: Salad, bg: "#E3EFE9", fg: "#2F6F5E" },
  "Arroz Colorido": { icon: Wheat, bg: "#FCEFD1", fg: "#C9A227" },
  Macarrão: { icon: CookingPot, bg: "#FCEFD1", fg: "#C9A227" },
  Bebidas: { icon: GlassWater, bg: "#E3EFE9", fg: "#2F6F5E" },
  Saquê: { icon: Wine, bg: "#E3EFE9", fg: "#2F6F5E" },
  Sobremesa: { icon: Cookie, bg: "#FBF3DE", fg: "#A8201A" },
};

function defaultVisual() {
  return { icon: ImageOff, bg: "#EDE4D0", fg: "#7A6F5C" };
}

const RESTAURANTE = {
  nome: "Restaurante Dragão Chinês",
  endereco: "Av. Anchieta - Ipiranga, Guarapari - ES, 29201-150",
  telefone: "(27) 3261-2717",
  horario: "Abre às 12:00",
  servicos: [
    { label: "Refeição no local", icon: UtensilsCrossed },
    { label: "Para viagem", icon: ShoppingBag },
    { label: "Entrega", icon: Bike },
  ],
};

// Usado caso o Supabase ainda não esteja configurado, ou se a busca falhar
// (assim o site nunca fica "vazio" pro visitante).
const CARDAPIO_FALLBACK = [
  {
    categoria: "Entrada",
    itens: [
      { nome: "Filet de Peixe à Palito", preco: 100 },
      { nome: "Camarão à Dorê", preco: 100 },
      { nome: "Posta de Peixe Frito", preco: 110 },
      { nome: "Rolinho Primavera", preco: 13 },
      { nome: "Gyoza (10 unidades)", preco: 60 },
    ],
  },
  {
    categoria: "Sopa",
    itens: [{ nome: "Sopa de Chop Suey", preco: 95 }],
  },
  {
    categoria: "Frango",
    itens: [
      { nome: "Frango Xadrez à Moda da Casa", descricao: "Receita da casa", preco: 165 },
      { nome: "Frango Xadrez com Molho Agridoce", descricao: "Molho agridoce da casa", preco: 165 },
      { nome: "Frango em Fatias com Molho de Curry", descricao: "Curry e cebola", preco: 165 },
      { nome: "Frango em Fatias e Verduras", descricao: "Legumes variados", preco: 165 },
    ],
  },
  {
    categoria: "Filet Mignon",
    itens: [
      { nome: "Contra-Filet Simples", preco: 90 },
      { nome: "Filet Simples", preco: 100 },
      { nome: "Filet com Fritas e Arroz", preco: 180 },
    ],
  },
  {
    categoria: "Filet de Frango",
    itens: [{ nome: "Frango Grelhado com Fritas e Arroz", preco: 170 }],
  },
  {
    categoria: "Guarnições",
    itens: [
      { nome: "Arroz", preco: 30 },
      { nome: "Fritas", preco: 40 },
    ],
  },
  {
    categoria: "Comida Chinesa",
    subtitulo: "Sugestão da casa",
    itens: [
      { nome: "Macarrão Bi-Fun", descricao: "Carne de porco, cenoura, repolho e legumes", preco: 180 },
      { nome: "Frango Frito com Molho de Pequim", descricao: "Molho de gengibre", preco: 200 },
      { nome: "Tepan Yaki na Chapa", descricao: "Contra-filé e verduras", preco: 210 },
      { nome: "Tepan Yaki na Chapa", descricao: "Filet mignon e verduras", preco: 260 },
      { nome: "Tepan Yaki na Chapa", descricao: "Frango e verduras", preco: 180 },
    ],
  },
  {
    categoria: "Carne de Boi",
    itens: [
      { nome: "Carne Desfiada Acebolada", preco: 180 },
      { nome: "Carne Desfiada com Bambu", preco: 180 },
      { nome: "Carne Desfiada com Bambu e Pimentão", preco: 180 },
      { nome: "Carne em Fatias com Legumes", descricao: "Acelga, cenoura, brócolis, couve-flor, bambu e cogumelos", preco: 180 },
      { nome: "Carne em Fatias com Molho Curry", descricao: "Vagem e cebola", preco: 180 },
    ],
  },
  {
    categoria: "Carne de Porco",
    itens: [
      { nome: "Carne de Porco em Fatias com Chop Suey", descricao: "Acelga, cenoura, brócolis, couve-flor, bambu e cogumelos", preco: 170 },
      { nome: "Porco Doce Azedo", descricao: "Cebola, cenoura, pimentão e abacaxi", preco: 170 },
      { nome: "Costela de Porco", preco: 120 },
    ],
  },
  {
    categoria: "Peixe",
    itens: [
      { nome: "Fatias de Peixe com Legumes", descricao: "Acelga, cenoura, brócolis, couve-flor, bambu e cogumelos", preco: 180 },
      { nome: "Fatias de Peixe com Azedo", descricao: "Filet de peixe frito, cebola, pimentão, cenoura e abacaxi", preco: 180 },
      { nome: "Fatias de Peixe Empanado", preco: 170 },
    ],
  },
  {
    categoria: "Legumes",
    itens: [
      { nome: "Misto de Verduras", descricao: "Repolho, couve-flor, bambu, cenoura, etc.", preco: 170 },
      { nome: "Chop Suey de Carne Desfiada", descricao: "Repolho, pimentão, cenoura, cebola e bambu", preco: 180 },
      { nome: "Chop Suey de Frango", descricao: "Repolho, pimentão, cenoura e bambu", preco: 170 },
    ],
  },
  {
    categoria: "Arroz Colorido",
    itens: [
      { nome: "Yakimeshi de Chop Suey", preco: 45 },
      { nome: "Yakimeshi de Camarão", preco: 60 },
      { nome: "Yakimeshi de Carne de Porco", preco: 55 },
      { nome: "Yakimeshi de Carne de Boi", preco: 55 },
    ],
  },
  {
    categoria: "Macarrão",
    itens: [
      { nome: "Macarrão Frito com Chop Suey (Yakissoba)", descricao: "Carne de boi, camarão, frango, brócolis, couve-flor, cenoura e acelga", preco: 180 },
      { nome: "Chop Suey de Carne Desfiada", descricao: "Repolho, pimentão, cenoura, cebola e bambu", preco: 180 },
      { nome: "Chop Suey de Frango", descricao: "Repolho, pimentão, cenoura e bambu", preco: 170 },
      { nome: "Meia Porção de Macarrão Frito com Chop Suey", preco: 105 },
    ],
  },
  {
    categoria: "Bebidas",
    itens: [
      { nome: "Suco Bendito Fruto", preco: 15 },
      { nome: "Refrigerante Lata", preco: 9 },
      { nome: "Refrigerante 600ml", preco: 10 },
      { nome: "Refrigerante 1,5L", preco: 15 },
      { nome: "Schweppes", preco: 10 },
      { nome: "Água", preco: 5 },
      { nome: "Água Tônica", preco: 10 },
      { nome: "H2O", preco: 10 },
      { nome: "Cerveja Latão", preco: 10 },
    ],
  },
  {
    categoria: "Saquê",
    itens: [
      { nome: "Saquê", preco: 30 },
      { nome: "Saquê Quente", preco: 35 },
    ],
  },
  {
    categoria: "Sobremesa",
    itens: [{ nome: "Caramelados", descricao: "Maçã, banana e abacaxi", preco: 35 }],
  },
];

function formatPreco(v) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

// As 4 etapas pelas quais todo pedido passa, na ordem.
const STATUS_PASSOS = [
  { key: "pendente", label: "Recebido" },
  { key: "preparando", label: "Preparando" },
  { key: "pronto", label: "Pronto" },
  { key: "entregue", label: "Entregue" },
];

const CHAVE_LOCALSTORAGE = "dragaoChines_pedidoAtivo";

// Garante que todo item tenha um "id" único (usado como chave do carrinho).
// Itens vindos do Supabase já trazem id real; os do fallback recebem um id sintético.
function comIds(cardapio) {
  return cardapio.map((cat) => ({
    ...cat,
    itens: cat.itens.map((item, i) => ({
      ...item,
      id: item.id || `${cat.categoria}-${i}`,
    })),
  }));
}

function DragonDivider() {
  return (
    <svg viewBox="0 0 1200 60" className="w-full h-8" preserveAspectRatio="none">
      <path
        d="M0 30 C 60 5, 120 55, 180 30 S 300 5, 360 30 S 480 55, 540 30 S 660 5, 720 30 S 840 55, 900 30 S 1020 5, 1080 30 S 1170 50, 1200 30"
        fill="none"
        stroke="#C9A227"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="40" cy="22" r="3" fill="#C9A227" />
      <circle cx="1160" cy="22" r="3" fill="#C9A227" />
    </svg>
  );
}

// Busca o cardápio no Supabase (tabelas categorias + pratos) e converte
// pro mesmo formato usado no resto do componente. Se o Supabase não estiver
// configurado (.env vazio) ou a busca falhar, devolve null e o site usa o
// CARDAPIO_FALLBACK acima, sem quebrar.
async function buscarCardapioDoSupabase() {
  if (!supabase) return null;

  const { data: categorias, error: erroCategorias } = await supabase
    .from("categorias")
    .select("id, nome, subtitulo, ordem")
    .order("ordem");

  if (erroCategorias || !categorias) return null;

  const { data: pratos, error: erroPratos } = await supabase
    .from("pratos")
    .select("id, categoria_id, nome, descricao, preco, imagem_url, disponivel, ordem")
    .eq("disponivel", true)
    .order("ordem");

  if (erroPratos || !pratos) return null;

  return categorias.map((cat) => ({
    categoria: cat.nome,
    subtitulo: cat.subtitulo || undefined,
    itens: pratos
      .filter((p) => p.categoria_id === cat.id)
      .map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao || undefined,
        preco: Number(p.preco),
        imagemUrl: p.imagem_url || undefined,
      })),
  }));
}

export default function DragaoChinesSite() {
  const [cardapio, setCardapio] = useState(() => comIds(CARDAPIO_FALLBACK));
  const [carregando, setCarregando] = useState(true);
  const [usandoSupabase, setUsandoSupabase] = useState(false);
  const categorias = useMemo(() => cardapio.map((c) => c.categoria), [cardapio]);
  const [ativo, setAtivo] = useState(categorias[0]);
  const grupoAtivo = cardapio.find((c) => c.categoria === ativo);

  useEffect(() => {
    buscarCardapioDoSupabase().then((resultado) => {
      if (resultado && resultado.length > 0) {
        setCardapio(comIds(resultado));
        setAtivo(resultado[0].categoria);
        setUsandoSupabase(true);
      }
      setCarregando(false);
    });
  }, []);

  const telefoneDigits = "552732612717";

  // ---- CARRINHO E PEDIDO ----
  const [carrinho, setCarrinho] = useState([]); // [{ id, nome, preco, quantidade }]
  const [painel, setPainel] = useState("fechado"); // 'fechado' | 'carrinho' | 'checkout' | 'confirmado'
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    tipo: "Retirada",
    endereco: "",
    observacoes: "",
  });

  // ---- ACOMPANHAMENTO DO PEDIDO ----
  // Guardamos o pedido ativo no localStorage do navegador (só nesse aparelho)
  // pra, se a pessoa fechar a aba e voltar, continuar vendo o status.
  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_LOCALSTORAGE);
    if (salvo) {
      try {
        const dados = JSON.parse(salvo);
        setPedidoConfirmado(dados);
      } catch (e) {
        localStorage.removeItem(CHAVE_LOCALSTORAGE);
      }
    }
  }, []);

  // Busca o status mais recente no Supabase a cada poucos segundos,
  // enquanto houver um pedido ativo (e ele ainda não tiver sido entregue).
  useEffect(() => {
    if (!supabase || !pedidoConfirmado?.idSupabase) return;
    if (pedidoConfirmado.status === "entregue") return;

    const buscarStatus = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("status")
        .eq("id", pedidoConfirmado.idSupabase)
        .single();
      if (!error && data && data.status !== pedidoConfirmado.status) {
        setPedidoConfirmado((atual) => {
          const atualizado = { ...atual, status: data.status };
          localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(atualizado));
          return atualizado;
        });
      }
    };

    buscarStatus();
    const intervalo = setInterval(buscarStatus, 6000);
    return () => clearInterval(intervalo);
  }, [pedidoConfirmado?.idSupabase, pedidoConfirmado?.status]);

  function fecharAcompanhamento() {
    localStorage.removeItem(CHAVE_LOCALSTORAGE);
    setPedidoConfirmado(null);
    setForm({ nome: "", telefone: "", tipo: "Retirada", endereco: "", observacoes: "" });
    setPainel("fechado");
  }

  function quantidadeNoCarrinho(itemId) {
    const linha = carrinho.find((c) => c.id === itemId);
    return linha ? linha.quantidade : 0;
  }

  function adicionarAoCarrinho(item) {
    setCarrinho((atual) => {
      const existe = atual.find((c) => c.id === item.id);
      if (existe) {
        return atual.map((c) => (c.id === item.id ? { ...c, quantidade: c.quantidade + 1 } : c));
      }
      return [...atual, { id: item.id, nome: item.nome, preco: item.preco, quantidade: 1 }];
    });
  }

  function alterarQuantidade(itemId, delta) {
    setCarrinho((atual) =>
      atual
        .map((c) => (c.id === itemId ? { ...c, quantidade: c.quantidade + delta } : c))
        .filter((c) => c.quantidade > 0)
    );
  }

  const totalItens = carrinho.reduce((soma, c) => soma + c.quantidade, 0);
  const totalPedido = carrinho.reduce((soma, c) => soma + c.quantidade * c.preco, 0);

  async function enviarPedido() {
    setErroEnvio("");
    if (!form.nome.trim() || !form.telefone.trim()) {
      setErroEnvio("Preencha seu nome e telefone para continuar.");
      return;
    }
    if (form.tipo === "Entrega" && !form.endereco.trim()) {
      setErroEnvio("Informe o endereço de entrega.");
      return;
    }

    setEnviando(true);
    let numeroPedido = null;
    let idSupabase = null;

    // Tenta salvar no Supabase (se estiver configurado), pra já ficar com histórico
    // de pedidos. Se falhar, o pedido aparece na tela do mesmo jeito.
    if (supabase) {
      try {
        const { data: pedido, error: erroPedido } = await supabase
          .from("pedidos")
          .insert({
            cliente_nome: form.nome,
            cliente_telefone: form.telefone,
            tipo: form.tipo === "Retirada" ? "viagem" : form.tipo === "Entrega" ? "entrega" : "local",
            endereco_entrega: form.tipo === "Entrega" ? form.endereco : null,
            status: "pendente",
            total: totalPedido,
          })
          .select()
          .single();

        if (!erroPedido && pedido) {
          numeroPedido = pedido.id.slice(0, 8);
          idSupabase = pedido.id;
          if (usandoSupabase) {
            const itensParaSalvar = carrinho.map((c) => ({
              pedido_id: pedido.id,
              prato_id: c.id,
              quantidade: c.quantidade,
              preco_unitario: c.preco,
            }));
            await supabase.from("itens_pedido").insert(itensParaSalvar);
          }
        }
      } catch (e) {
        // segue o fluxo mesmo se o Supabase falhar
      }
    }

    const novoPedidoConfirmado = {
      numero: numeroPedido,
      idSupabase,
      status: "pendente",
      itens: [...carrinho],
      total: totalPedido,
      tipo: form.tipo,
      nome: form.nome,
      telefone: form.telefone,
      endereco: form.endereco,
      observacoes: form.observacoes,
    };

    setPedidoConfirmado(novoPedidoConfirmado);
    if (idSupabase) {
      localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(novoPedidoConfirmado));
    }
    setCarrinho([]);
    setEnviando(false);
    setPainel("confirmado");
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#F7F1E5", fontFamily: "'Work Sans', sans-serif", color: "#1B1714" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        ::selection { background: #C9A227; color: #1B1714; }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(27,23,20,0.95)" }}>
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DragonMark />
            <span className="font-display text-lg tracking-wide" style={{ color: "#F7F1E5" }}>
              Dragão Chinês
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm" style={{ color: "#C9A227" }}>
            <Clock size={15} />
            <span>{RESTAURANTE.horario}</span>
          </div>
          <a
            href={`tel:${telefoneDigits}`}
            className="flex items-center gap-1.5 text-sm font-medium rounded-full px-3 py-1.5"
            style={{ background: "#A8201A", color: "#F7F1E5" }}
          >
            <Phone size={14} /> Ligar
          </a>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative px-5 pt-16 pb-14 text-center overflow-hidden"
        style={{ background: "#1B1714" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, #A8201A 0%, transparent 45%), radial-gradient(circle at 15% 85%, #C9A227 0%, transparent 35%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <DragonMark size={56} />
          <h1
            className="font-display mt-5 text-4xl sm:text-5xl font-semibold leading-tight"
            style={{ color: "#F7F1E5" }}
          >
            Restaurante Dragão Chinês
          </h1>
          <p className="mt-3 text-base sm:text-lg" style={{ color: "#D8CDB8" }}>
            Sabores chineses tradicionais em Guarapari, no chapa, no vapor e no caldeirão.
          </p>
          <div
            className="inline-flex items-center gap-2 mt-6 rounded-full px-4 py-2 text-sm font-medium"
            style={{ background: "rgba(201,162,39,0.15)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.4)" }}
          >
            <Clock size={15} /> {RESTAURANTE.horario}
          </div>
          <div className="mt-7">
            <a
              href="#cardapio"
              className="inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: "#C9A227", color: "#1B1714" }}
            >
              Ver cardápio <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <div style={{ background: "#1B1714" }}>
        <DragonDivider />
      </div>

      {/* CARDÁPIO */}
      <section id="cardapio" className="px-5 py-12 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-semibold text-center" style={{ color: "#A8201A" }}>
          Cardápio
        </h2>
        <p className="text-center text-sm mt-1.5" style={{ color: "#5C5346" }}>
          Toque em uma categoria para ver os pratos
          {carregando && <span className="block mt-1 italic">Carregando cardápio…</span>}
        </p>

        {/* category pills */}
        <div className="flex gap-2 overflow-x-auto mt-6 pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setAtivo(cat)}
              className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={
                ativo === cat
                  ? { background: "#A8201A", color: "#F7F1E5" }
                  : { background: "#EDE4D0", color: "#1B1714" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* items */}
        {grupoAtivo && (
          <div className="mt-7">
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const visual = CATEGORIA_VISUAL[grupoAtivo.categoria] || defaultVisual();
                const Icon = visual.icon;
                return (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: visual.bg }}
                  >
                    <Icon size={20} style={{ color: visual.fg }} />
                  </div>
                );
              })()}
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-2xl font-semibold">{grupoAtivo.categoria}</h3>
                {grupoAtivo.subtitulo && (
                  <span className="text-xs uppercase tracking-wide" style={{ color: "#2F6F5E" }}>
                    {grupoAtivo.subtitulo}
                  </span>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {grupoAtivo.itens.map((item) => {
                const visual = CATEGORIA_VISUAL[grupoAtivo.categoria] || defaultVisual();
                const Icon = visual.icon;
                const qtd = quantidadeNoCarrinho(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl px-4 py-3.5"
                    style={{ background: "#FFFFFF", border: "1px solid #EDE4D0" }}
                  >
                    {item.imagemUrl ? (
                      <img
                        src={item.imagemUrl}
                        alt={item.nome}
                        className="shrink-0 w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="shrink-0 w-14 h-14 rounded-lg flex items-center justify-center"
                        style={{ background: visual.bg }}
                        aria-hidden="true"
                      >
                        <Icon size={22} style={{ color: visual.fg }} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium leading-snug">{item.nome}</p>
                        <span
                          className="shrink-0 font-display text-sm font-semibold rounded-full px-2.5 py-1"
                          style={{ background: "#FBF3DE", color: "#A8201A" }}
                        >
                          R$ {formatPreco(item.preco)}
                        </span>
                      </div>
                      {item.descricao && (
                        <p className="text-xs mt-0.5" style={{ color: "#7A6F5C" }}>
                          {item.descricao}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        {qtd > 0 && (
                          <>
                            <button
                              onClick={() => alterarQuantidade(item.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "#EDE4D0", color: "#1B1714" }}
                              aria-label={`Remover ${item.nome}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">{qtd}</span>
                          </>
                        )}
                        <button
                          onClick={() => adicionarAoCarrinho(item)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: "#A8201A", color: "#F7F1E5" }}
                          aria-label={`Adicionar ${item.nome}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="px-5">
        <DragonDivider />
      </div>

      {/* SOBRE / CONTATO */}
      <section id="contato" className="px-5 py-12 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-semibold text-center" style={{ color: "#A8201A" }}>
          Sobre &amp; Contato
        </h2>

        <div className="grid sm:grid-cols-3 gap-3 mt-7">
          {RESTAURANTE.servicos.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl py-5 px-3 text-center"
              style={{ background: "#FFFFFF", border: "1px solid #EDE4D0" }}
            >
              <div
                className="rounded-full p-2.5"
                style={{ background: "#EAF2EE", color: "#2F6F5E" }}
              >
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl p-5 sm:p-6" style={{ background: "#1B1714", color: "#F7F1E5" }}>
          <div className="flex items-start gap-3">
            <MapPin size={18} style={{ color: "#C9A227" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#C9A227" }}>
                Endereço
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#D8CDB8" }}>
                {RESTAURANTE.endereco}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 mt-4">
            <Phone size={18} style={{ color: "#C9A227" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#C9A227" }}>
                Telefone
              </p>
              <a href={`tel:${telefoneDigits}`} className="text-sm mt-0.5 block" style={{ color: "#D8CDB8" }}>
                {RESTAURANTE.telefone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 mt-4">
            <Clock size={18} style={{ color: "#C9A227" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#C9A227" }}>
                Horário
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#D8CDB8" }}>
                {RESTAURANTE.horario}
              </p>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANTE.endereco)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-5 rounded-full px-4 py-2 text-sm font-medium"
            style={{ background: "#C9A227", color: "#1B1714" }}
          >
            Ver no mapa <ChevronRight size={14} />
          </a>
        </div>
      </section>

      <footer className="text-center text-xs py-6 pb-24" style={{ color: "#9A8F7B" }}>
        Restaurante Dragão Chinês — protótipo de site
      </footer>

      {/* BARRA DE ACOMPANHAMENTO DO PEDIDO */}
      {pedidoConfirmado && painel === "fechado" && (
        <button
          onClick={() => setPainel("confirmado")}
          className="fixed top-14 left-0 right-0 z-30 px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-medium"
          style={{ background: "#2F6F5E", color: "#F7F1E5" }}
        >
          Pedido {pedidoConfirmado.numero ? `#${pedidoConfirmado.numero}` : ""} ·{" "}
          {STATUS_PASSOS.find((s) => s.key === pedidoConfirmado.status)?.label || "Recebido"}
          <ChevronRight size={14} />
        </button>
      )}

      {/* BARRA FLUTUANTE DO CARRINHO */}
      {totalItens > 0 && painel === "fechado" && (
        <button
          onClick={() => setPainel("carrinho")}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 rounded-full px-5 py-3.5 flex items-center justify-between shadow-lg"
          style={{ background: "#A8201A", color: "#F7F1E5" }}
        >
          <span className="flex items-center gap-2 font-medium text-sm">
            <ShoppingCart size={18} />
            {totalItens} {totalItens === 1 ? "item" : "itens"}
          </span>
          <span className="font-display font-semibold">R$ {formatPreco(totalPedido)}</span>
        </button>
      )}

      {/* PAINEL: CARRINHO / CHECKOUT / CONFIRMAÇÃO */}
      {painel !== "fechado" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(27,23,20,0.55)" }}
            onClick={() => painel !== "confirmado" && setPainel("fechado")}
          />
          <div
            className="relative w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto"
            style={{ background: "#F7F1E5" }}
          >
            {/* CARRINHO */}
            {painel === "carrinho" && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-semibold">Seu pedido</h3>
                  <button onClick={() => setPainel("fechado")} aria-label="Fechar">
                    <X size={20} />
                  </button>
                </div>

                {carrinho.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "#7A6F5C" }}>
                    Seu carrinho está vazio.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {carrinho.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{c.nome}</p>
                          <p className="text-xs" style={{ color: "#7A6F5C" }}>
                            R$ {formatPreco(c.preco)} cada
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alterarQuantidade(c.id, -1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "#EDE4D0" }}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">{c.quantidade}</span>
                          <button
                            onClick={() => alterarQuantidade(c.id, 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "#EDE4D0" }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div
                      className="flex items-center justify-between pt-3 mt-3"
                      style={{ borderTop: "1px solid #EDE4D0" }}
                    >
                      <span className="font-medium">Total</span>
                      <span className="font-display text-lg font-semibold" style={{ color: "#A8201A" }}>
                        R$ {formatPreco(totalPedido)}
                      </span>
                    </div>

                    <button
                      onClick={() => setPainel("checkout")}
                      className="w-full mt-4 rounded-full py-3 text-sm font-semibold"
                      style={{ background: "#A8201A", color: "#F7F1E5" }}
                    >
                      Continuar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CHECKOUT */}
            {painel === "checkout" && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setPainel("carrinho")} className="text-sm" style={{ color: "#7A6F5C" }}>
                    ← Voltar
                  </button>
                  <button onClick={() => setPainel("fechado")} aria-label="Fechar">
                    <X size={20} />
                  </button>
                </div>
                <h3 className="font-display text-xl font-semibold mb-4">Finalizar pedido</h3>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    {["Local", "Retirada", "Entrega"].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setForm((f) => ({ ...f, tipo }))}
                        className="flex-1 rounded-full py-2 text-xs font-medium"
                        style={
                          form.tipo === tipo
                            ? { background: "#A8201A", color: "#F7F1E5" }
                            : { background: "#EDE4D0", color: "#1B1714" }
                        }
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm"
                    style={{ border: "1px solid #EDE4D0", background: "#FFFFFF" }}
                  />
                  <input
                    type="tel"
                    placeholder="Telefone (com DDD)"
                    value={form.telefone}
                    onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm"
                    style={{ border: "1px solid #EDE4D0", background: "#FFFFFF" }}
                  />
                  {form.tipo === "Entrega" && (
                    <input
                      type="text"
                      placeholder="Endereço completo para entrega"
                      value={form.endereco}
                      onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                      className="w-full rounded-lg px-3.5 py-2.5 text-sm"
                      style={{ border: "1px solid #EDE4D0", background: "#FFFFFF" }}
                    />
                  )}
                  <textarea
                    placeholder="Observações (opcional) — ex: sem cebola, troco para R$ 100..."
                    value={form.observacoes}
                    onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm resize-none"
                    style={{ border: "1px solid #EDE4D0", background: "#FFFFFF" }}
                  />

                  {erroEnvio && (
                    <p className="text-xs font-medium" style={{ color: "#A8201A" }}>
                      {erroEnvio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-sm">Total</span>
                    <span className="font-display text-lg font-semibold" style={{ color: "#A8201A" }}>
                      R$ {formatPreco(totalPedido)}
                    </span>
                  </div>

                  <button
                    onClick={enviarPedido}
                    disabled={enviando}
                    className="w-full rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: "#A8201A", color: "#F7F1E5", opacity: enviando ? 0.7 : 1 }}
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Confirmar pedido
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* CONFIRMAÇÃO / ACOMPANHAMENTO */}
            {painel === "confirmado" && pedidoConfirmado && (
              <div className="p-6">
                <div className="flex justify-end mb-1">
                  <button onClick={() => setPainel("fechado")} aria-label="Fechar">
                    <X size={20} />
                  </button>
                </div>
                <div className="text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: "#E3EFE9" }}
                  >
                    <CheckCircle2 size={28} style={{ color: "#2F6F5E" }} />
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    {pedidoConfirmado.status === "entregue" ? "Pedido entregue!" : "Acompanhe seu pedido"}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "#7A6F5C" }}>
                    {pedidoConfirmado.numero ? `Pedido #${pedidoConfirmado.numero}` : "Pedido"} ·{" "}
                    {pedidoConfirmado.tipo}
                  </p>
                </div>

                {/* Stepper de status */}
                <div className="flex items-center justify-between mt-6 mb-2 px-1">
                  {STATUS_PASSOS.map((passo, i) => {
                    const indiceAtual = STATUS_PASSOS.findIndex((s) => s.key === pedidoConfirmado.status);
                    const concluido = i <= indiceAtual;
                    return (
                      <React.Fragment key={passo.key}>
                        <div className="flex flex-col items-center gap-1.5" style={{ width: 56 }}>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={
                              concluido
                                ? { background: "#2F6F5E", color: "#F7F1E5" }
                                : { background: "#EDE4D0", color: "#9A8F7B" }
                            }
                          >
                            {i + 1}
                          </div>
                          <span
                            className="text-[11px] text-center leading-tight"
                            style={{ color: concluido ? "#2F6F5E" : "#9A8F7B" }}
                          >
                            {passo.label}
                          </span>
                        </div>
                        {i < STATUS_PASSOS.length - 1 && (
                          <div
                            className="flex-1 h-0.5 -mt-4"
                            style={{ background: i < indiceAtual ? "#2F6F5E" : "#EDE4D0" }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                {!usandoSupabase && (
                  <p className="text-[11px] text-center mt-1" style={{ color: "#9A8F7B" }}>
                    (Supabase ainda não conectado — status fica em "Recebido" por enquanto)
                  </p>
                )}

                <div className="text-left mt-5 rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #EDE4D0" }}>
                  {pedidoConfirmado.itens.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1">
                      <span>
                        {c.quantidade}x {c.nome}
                      </span>
                      <span style={{ color: "#7A6F5C" }}>R$ {formatPreco(c.quantidade * c.preco)}</span>
                    </div>
                  ))}
                  <div
                    className="flex items-center justify-between pt-2 mt-2 text-sm font-semibold"
                    style={{ borderTop: "1px solid #EDE4D0" }}
                  >
                    <span>Total</span>
                    <span style={{ color: "#A8201A" }}>R$ {formatPreco(pedidoConfirmado.total)}</span>
                  </div>
                </div>

                <p className="text-xs mt-4 text-center" style={{ color: "#7A6F5C" }}>
                  Pagamento na {pedidoConfirmado.tipo === "Entrega" ? "entrega" : "retirada"}. Em breve o
                  restaurante vai te chamar no telefone <strong>{pedidoConfirmado.telefone}</strong> para
                  confirmar.
                </p>

                <button
                  onClick={fecharAcompanhamento}
                  className="w-full mt-5 rounded-full py-3 text-sm font-semibold"
                  style={{ background: "#1B1714", color: "#F7F1E5" }}
                >
                  Fazer novo pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DragonMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M8 40c4-10 14-18 24-16 6 1.3 8 6 13 6 3 0 5-2 7-5-1 7-5 11-10 11-5 0-7-3-11-3-7 0-13 6-15 13-2-2-6-3-8-6z"
        fill="#A8201A"
      />
      <circle cx="46" cy="22" r="2.4" fill="#C9A227" />
      <path d="M8 40c4 4 9 6 14 5" stroke="#C9A227" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
