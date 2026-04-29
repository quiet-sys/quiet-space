import Terminal from "@/components/Terminal";
import FallingParticles from "@/components/FallingParticles";
import DigitalRain from "@/components/DigitalRain";

export default function AgentPage() {
  return (
    <div className="min-h-screen pt-14 relative">
      <DigitalRain />
      <FallingParticles
        count={50}
        color="#00f0ff"
        type="snow"
        sizeRange={[1, 3]}
        speedRange={[0.2, 0.8]}
        opacityRange={[0.1, 0.3]}
      />
      <div className="relative z-10 h-[calc(100vh-3.5rem)] border-t border-accent/20 bg-black/50 backdrop-blur-sm shadow-[0_0_40px_rgba(0,240,255,0.06),inset_0_0_80px_rgba(0,240,255,0.02)]">
        <Terminal fullPage />
      </div>
    </div>
  );
}
