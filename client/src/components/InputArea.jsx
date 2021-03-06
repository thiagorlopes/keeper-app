import React, { useState, useEffect, useRef } from "react";
import NoteDataService from "../services/NoteService";
import Button from "./Button";
import AutoTextArea from "./AutoTextArea";

function InputArea(props) {
  // Input and textarea are initially blank
  const [newNote, setNewNote] = useState({
    userId: props.userId,
    id: 1,
    title: "",
    content: "",
    completed: false,
  });

  // Set id for new note and input or textarea value according to name: title or content
  function handleChange(event) {
    const { name, value } = event.target;

    setNewNote((prevNote) => {
      return {
        ...prevNote,
        [name]: value,
      };
    });
  }

  // Focus input after initial render of InputArea
  const [toggleFocus, setToggleFocus] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, [toggleFocus]);

  // Attempts to create note with controller
  function submitNote(event) {
    NoteDataService.create(newNote)
      .then((response) => {
        // Clears input area for new input
        setNewNote((prevNote) => {
          return {
            ...prevNote,
            title: "",
            content: "",
          };
        });

        // Pass new note to App.jsx for inserting in array
        props.onAdd(response.data);

        setToggleFocus(!toggleFocus);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  // Render InputArea
  return (
    <div>
      <form className="create-note-form" required>
        <input
          ref={inputRef}
          className="note-title"
          onChange={handleChange}
          onKeyPress={(e) => {
            e.key === "Enter" && e.preventDefault();
          }}
          value={newNote.title}
          name="title"
          placeholder="Title"
        />

        <AutoTextArea
          onChange={handleChange}
          className="note-content"
          name="content"
          content={newNote.content}
          inputArea={true}
          rows="3"
        />

        <Button
          type="add"
          className="create-note-form"
          onAdd={newNote.title !== "" ? submitNote : null}
        />
      </form>
    </div>
  );
}

export default InputArea;
