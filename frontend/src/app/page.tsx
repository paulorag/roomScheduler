import BookingForm from "@/components/BookingForm";
import { Room } from "@/types";

// Função para buscar dados (Server Side)
async function getRooms(): Promise<Room[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Falha ao buscar salas");
        }

        return res.json();
    } catch (error) {
        console.error("Erro no fetch:", error);
        return [];
    }
}

export default async function Home() {
    const rooms = await getRooms();

    return (
        // Container principal com espaçamento adequado
        <main className="max-w-7xl mx-auto p-6 lg:p-8">
            <header className="mb-12 text-center lg:text-left">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                    Espaços Disponíveis
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Reserve sua sala de reunião de forma simples e rápida.
                </p>
            </header>

            {rooms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xl">
                        Nenhuma sala encontrada no momento.
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        Verifique se o backend está rodando.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        // Cartão da Sala
                        <div
                            key={room.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">
                                    {room.name}
                                </h2>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                        />
                                    </svg>
                                    <span>
                                        Capacidade:{" "}
                                        <strong>{room.capacity} pessoas</strong>
                                    </span>
                                </div>
                            </div>

                            {/* O formulário agora é o botão que abre o modal */}
                            <BookingForm
                                roomId={room.id}
                                roomName={room.name}
                            />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
