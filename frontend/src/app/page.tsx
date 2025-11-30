import { Room } from "@/types";
import BookingForm from "@/components/BookingForm";

async function getRooms(): Promise<Room[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Falha ao buscar salas");
    }
    return res.json();
}

export default async function Home() {
    const rooms = await getRooms();

    return (
        <main className="min-h-screen p-8 font-sans">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Salas Disponíves
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className="border p-6 rounded-lg shadow-sm hover:shadow-md transition bg-white"
                    >
                        <h2 className="text-xl font-semibold text-blue-600">
                            {room.name}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Capacidade:{" "}
                            <span className="font-bold">{room.capacity}</span>{" "}
                            pessoas
                        </p>
                        <BookingForm roomId={room.id} />
                    </div>
                ))}

                {rooms.length === 0 && (
                    <p className="text-gray-500 col-span-3">
                        Nenhuma sala cadastrada no sistema
                    </p>
                )}
            </div>
        </main>
    );
}
