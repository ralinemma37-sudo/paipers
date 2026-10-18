import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * L'appli Paipers (version web de l'appli mobile) est copiée dans public/app.
   * Toute adresse /app/… sans fichier correspondant renvoie à la page de l'appli, qui affiche le bon écran.
   */
  async rewrites() {
    return [
      { source: "/app", destination: "/app/index.html" },
      { source: "/app/:path*", destination: "/app/index.html" },
    ];
  },
  async headers() {
    return [
      {
        // Réduit la fuite du token via l’en-tête Referer (historique / analytics).
        source: "/waitlist/confirm",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
