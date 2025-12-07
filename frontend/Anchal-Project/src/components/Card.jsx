import React from 'react'

const Card = ({
  card
  // editId,
  // editName,
  // setEditId,
  // setEditName,
  // handleUpdate,
  // handleDelete
}) => {
  return (
    <div className="card">
      {/* {editId === card._id ? (
        <>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            type="text"
          />
          <button onClick={handleUpdate}>Save</button>
        </>
      ) : (
        <> */}
          <h3>{card.name}</h3>
          <p>{card.desc}</p>

          {/* <button
            onClick={() => {
              setEditId(card._id);
              setEditName(card.name);
            }}
          >
            Edit
          </button>

          <button onClick={() => handleDelete(card._id)}>Delete</button>
        </>
      )} */}
    </div>
  );
}

export default Card;
