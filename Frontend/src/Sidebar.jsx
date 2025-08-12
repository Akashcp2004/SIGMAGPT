import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import logo from "./assets/blacklogo.png"; // import logo correctly

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all threads from backend
  const getAllThreads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/api/thread");
      if (!response.ok) {
        throw new Error("Failed to fetch threads");
      }
      const res = await response.json();
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching threads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  // Create new chat with fresh state and new uuid
  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  // Switch to another thread by id and load its chats
  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch thread chats");
      }
      const res = await response.json();
      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete thread by id and update UI accordingly
  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete thread");
      }
      const res = await response.json();
      console.log(res);

      // Remove deleted thread from state
      setAllThreads((prev) => prev.filter((thread) => thread.threadId !== threadId));

      // If deleted thread is current, create a new chat
      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="sidebar">
      <button onClick={createNewChat} className="new-chat-btn">
        <img src={logo} alt="gpt logo" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <div className="history">
        {loading && <p>Loading threads...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && allThreads?.length === 0 && <p>No chats found.</p>}

        <ul>
          {allThreads?.map((thread) => (
            <li
              key={thread.threadId}
              onClick={() => changeThread(thread.threadId)}
              className={thread.threadId === currThreadId ? "highlighted" : ""}
            >
              {thread.title}
              <i
                className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering changeThread
                  deleteThread(thread.threadId);
                }}
              ></i>
            </li>
          ))}
        </ul>
      </div>

      <div className="sign">
        <p>
          By ApnaCollege &hearts;
        </p>
      </div>
    </section>
  );
}

export default Sidebar;
