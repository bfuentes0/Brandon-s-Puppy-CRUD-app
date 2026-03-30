import { useEffect, useState } from "react";
import api, { setAuthToken } from "../api";
import "../App.css";
import { useAsgardeo } from "@asgardeo/react";

export default function Body() {
  const { state, getAccessToken } = useAsgardeo();
  const [puppies, setPuppies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: ""
  });

  // token after login
useEffect(() => {
  async function init() {
    try {
      const token = await getAccessToken();
      if (token) {
        console.log("Loaded token:", token);
        setAuthToken(token);
        console.log("Axios headers:", api.defaults.headers.common);
        await load();
      }
    } catch (err) {
      console.log("Token not ready yet");
    }
  }

  init();
}, []);


  // GET ALL puppies
  const load = async () => {
    const res = await api.get("/puppies");
    setPuppies(res.data);
  };

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));


  // POST puppy
  const onSubmit = async (e) => {
    e.preventDefault();

    const body = {
      name: form.name,
      breed: form.breed,
      age: Number(form.age)
    };

    if (isEditing) {
      await api.put(`/puppies/${editId}`, body);
    } else {
      await api.post("/puppies", body);
    }

    setForm({ name: "", breed: "", age: "" });
    setIsEditing(false);
    setEditId(null);
    await load();   
  };

  // PUT puppy
  const handleEdit = async (id) => {
    const res = await api.get(`/puppies/${id}`);
    const p = res.data;

    setForm({
      name: p.name,
      breed: p.breed,
      age: p.age
    });

    setIsEditing(true);
    setEditId(id);
  };

  // DELETE puppy
  const handleDelete = async (id) => {
    await api.delete(`/puppies/${id}`);
    await load();
  };


  // TABLE
  return (
    <div className="card" style={{ margin: 20 }}>
      <h1>Puppies</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Breed</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {puppies.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.breed}</td>
              <td>{p.age}</td>

              <td>
                <button onClick={() => handleEdit(p.id)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <h2>{isEditing ? "Update Puppy" : "Add New Puppy"}</h2>

      <form onSubmit={onSubmit} style={{ marginBottom: 20 }}>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Name"
        />

        <input
          name="breed"
          value={form.breed}
          onChange={onChange}
          placeholder="Breed"
        />

        <input
          name="age"
          type="number"
          value={form.age}
          onChange={onChange}
          placeholder="Age"
        />

        <button type="submit">
          {isEditing ? "Update Puppy" : "Add Puppy"}
        </button>
      </form>
    </div>
  );
}