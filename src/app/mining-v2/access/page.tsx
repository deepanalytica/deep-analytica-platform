import AccessForm from "./AccessForm";

export const metadata = {
  title: "Acceso privado · Deep Mining Intelligence",
};

export default function MiningV2AccessPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "radial-gradient(circle at 50% 20%, #12212b 0, #070b0e 40%, #050709 100%)",
      color: "#eef6fa",
    }}>
      <section style={{
        width: "min(430px, 100%)",
        border: "1px solid #22313b",
        background: "rgba(8, 14, 18, .92)",
        borderRadius: 16,
        padding: 28,
        boxShadow: "0 30px 80px rgba(0,0,0,.35)",
      }}>
        <p style={{ margin: 0, fontSize: 11, letterSpacing: ".16em", color: "#6f91a3" }}>
          DEEP ANALYTICA · PRIVATE BETA
        </p>
        <h1 style={{ fontSize: 28, letterSpacing: "-.04em", margin: "10px 0 8px" }}>
          Mining Intelligence V2
        </h1>
        <p style={{ color: "#8c9aa5", lineHeight: 1.55, margin: "0 0 22px" }}>
          Superficie privada de decisión, anticipación y trazabilidad.
        </p>
        <AccessForm />
        <p style={{ color: "#596873", fontSize: 11, lineHeight: 1.5, margin: "18px 0 0" }}>
          La contraseña no se almacena en el repositorio. El acceso depende de variables de entorno y una sesión firmada.
        </p>
      </section>
    </main>
  );
}
