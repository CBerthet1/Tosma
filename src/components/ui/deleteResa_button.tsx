"use client";

import { DeleteResa } from "../../app/actions_serveur/DeleteResa"; 

export function DeleteResa_button({ id }: { id: number }) {
  const handleDelete = async () => {
    const confirmed = window.confirm("Es-tu sûr de vouloir supprimer cette réservation ?");
    
    if (confirmed) {
      await DeleteResa(id);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      Supprimer
    </button>
  );
}