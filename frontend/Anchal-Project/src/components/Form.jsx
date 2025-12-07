import React from 'react'
import { useState, useEffect } from "react";




const Form = ({ onCreate }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = async () => {
    console.log("Submit clicked! Name:", name, "Desc:", desc);
    if (!name.trim()) {
      console.log("Name is empty, returning");
      return;
    }
    try {
      console.log("Calling onCreate...");
      await onCreate(name, desc);
      console.log("onCreate completed");
      setName("");
      setDesc("");
    } catch (err) {
      console.error("Error creating card:", err);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}

export default Form;