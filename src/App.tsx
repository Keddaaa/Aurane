import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri"; 

// Définition du type d'une police
type Font = {
  name: string;
  url: string;
};

function App() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Font[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction appelée lors de la recherche
  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);

    try {
      const fonts = await invoke<Font[]>("search_fonts", { query: trimmedQuery }); // ✅ Typed invoke
      setResults(fonts);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la recherche de polices.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Injection dynamique des polices
  useEffect(() => {
    results.forEach((font) => {
      const id = `font-${font.name}`;
      if (document.getElementById(id)) return;

      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @font-face {
          font-family: '${font.name}';
          src: url('${font.url}');
        }
      `;
      document.head.appendChild(style);
    });
  }, [results]);

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Aurane</h1>
      <p className="mb-6 text-gray-600">Recherche et installe des polices en un clic.</p>

      {/* Barre de recherche */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Rechercher une police..."
          className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Chargement..." : "Rechercher"}
        </button>
      </div>

      {/* Message d'erreur */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Résultats */}
      <div className="space-y-6">
        {results.length === 0 && !loading && !error && (
          <p className="text-gray-500 italic">Aucune police trouvée. Essayez autre chose.</p>
        )}

        {results.map((font, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{font.name}</h2>
            <div
              className="p-4 border-t border-gray-200 mt-2"
              style={{
                fontFamily: font.name,
                fontSize: "24px",
              }}
            >
              Aperçu : Le petit chat est mignon.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
