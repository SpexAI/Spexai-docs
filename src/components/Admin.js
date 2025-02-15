import { useState, useEffect } from "react";
import styled from "styled-components";
import MDEditor from "@uiw/react-md-editor";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { uploadFile } from "../utils/storage";
import { useNavigate } from "react-router-dom";

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: ${(props) => props.theme.colors.text};
`;

const AdminHeader = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    color: ${(props) => props.theme.colors.text};
  }
`;

const SectionCard = styled.div`
  background: ${(props) => props.theme.colors.sidebar};
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const ItemCard = styled.div`
  background: ${(props) => props.theme.colors.background};
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const Form = styled.form`
  background: ${(props) => props.theme.colors.sidebar};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  small {
    color: ${(props) => props.theme.colors.textMuted};
    margin-top: 0.5rem;
    display: block;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 1rem;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  transition: all 0.2s ease;

  &:focus {
    border-color: ${(props) => props.theme.colors.accent};
    outline: none;
    box-shadow: 0 0 0 2px ${(props) => `${props.theme.colors.accent}33`};
  }

  &:disabled {
    background: ${(props) => props.theme.colors.sidebar};
    color: ${(props) => props.theme.colors.textMuted};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textMuted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 1rem;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${(props) => props.theme.colors.accent};
    outline: none;
    box-shadow: 0 0 0 2px ${(props) => `${props.theme.colors.accent}33`};
  }

  option {
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
  }
`;

const AdminButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  background: linear-gradient(
    97.38deg,
    #fe3f68 -5.06%,
    #9b4bcc 30.57%,
    #4a6eec 74.68%,
    #2fdda2 105.9%
  );
  border: none;
  border-radius: 40px !important;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
  margin: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const EditorContainer = styled.div`
  .w-md-editor {
    background: ${(props) => props.theme.colors.background} !important;
    color: ${(props) => props.theme.colors.text} !important;
    border: 1px solid ${(props) => props.theme.colors.border} !important;
  }

  .w-md-editor-toolbar {
    background: ${(props) => props.theme.colors.sidebar} !important;
    border-color: ${(props) => props.theme.colors.border} !important;
  }

  .w-md-editor-text {
    color: ${(props) => props.theme.colors.text} !important;
  }

  .w-md-editor-preview {
    background: ${(props) => props.theme.colors.background} !important;
    color: ${(props) => props.theme.colors.text} !important;
  }

  .w-md-editor-input {
    background: ${(props) => props.theme.colors.background} !important;
    color: ${(props) => props.theme.colors.text} !important;
  }

  .wmde-markdown {
    background: ${(props) => props.theme.colors.background} !important;
    color: ${(props) => props.theme.colors.text} !important;
  }
`;

const ItemsList = styled.div`
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid ${(props) => props.theme.colors.border};
`;

const SectionsList = styled.div`
  margin-top: ${(props) => props.theme.spacing.xl};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  padding-top: ${(props) => props.theme.spacing.xl};
`;

const DocsList = styled.div`
  margin-left: ${(props) => props.theme.spacing.lg};
  padding-left: ${(props) => props.theme.spacing.lg};
  border-left: 2px solid ${(props) => props.theme.colors.border};
`;

const DocItem = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.sm};
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileUploadButton = styled(AdminButton)`
  margin-bottom: 1rem;
`;

const UploadInput = styled.input`
  display: none;
`;

const SubItemsList = styled.div`
  margin-left: ${(props) => props.theme.spacing.xl};
  padding: ${(props) => props.theme.spacing.md};
  border-left: 2px solid ${(props) => props.theme.colors.border};
`;

const SubItemForm = styled.div`
  background: ${(props) => props.theme.colors.sidebar};
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
`;

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? props.theme.colors.accent : "transparent")};
  color: ${(props) =>
    props.active ? props.theme.colors.accent : props.theme.colors.text};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${(props) => props.theme.colors.accent};
  }
`;

const DeleteButton = styled(AdminButton)`
  background: linear-gradient(97.38deg, #ff4444 -5.06%, #ff0000 105.9%);
`;

const BackButton = styled(AdminButton)`
  margin-bottom: 2rem;
`;

export default function Admin() {
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState({
    title: "",
    type: "public",
    order: 0,
    items: [
      {
        title: "",
        id: "",
        content: "",
        order: 0,
      },
    ],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("new"); // 'new' or 'existing'
  const [uploading, setUploading] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();

  // Load existing sections
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      console.log("Loading sections...");
      const sectionsSnapshot = await getDocs(collection(db, "sections"));
      console.log(
        "Sections snapshot:",
        sectionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const sectionsData = [];

      for (const sectionDoc of sectionsSnapshot.docs) {
        const section = {
          ...sectionDoc.data(),
          id: sectionDoc.id,
        };

        console.log("Loading items for section:", section.id);
        const itemsSnapshot = await getDocs(
          query(collection(db, "docs"), where("sectionId", "==", section.id))
        );

        console.log(
          "Items snapshot:",
          itemsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        section.items = itemsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          firebaseId: doc.id,
        }));

        sectionsData.push(section);
      }

      console.log("Final sections data:", sectionsData);
      setSections(sectionsData);
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  const handleAddItem = () => {
    setCurrentSection((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          title: "",
          id: "",
          content: "",
          order: prev.items.length,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setCurrentSection((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setCurrentSection((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        id: field === "title" ? slugify(value) : newItems[index].id,
      };
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        // Update existing section
        await updateDoc(doc(db, "sections", currentSection.id), {
          title: currentSection.title,
          type: currentSection.type,
          order: currentSection.order,
        });

        // Update or create items
        for (const item of currentSection.items) {
          if (item.firebaseId) {
            await updateDoc(doc(db, "docs", item.firebaseId), {
              title: item.title,
              id: item.id,
              content: item.content,
              order: item.order,
            });
          } else {
            await addDoc(collection(db, "docs"), {
              ...item,
              sectionId: currentSection.id,
            });
          }
        }
      } else {
        // Create new section
        const sectionRef = await addDoc(collection(db, "sections"), {
          title: currentSection.title,
          type: currentSection.type,
          order: currentSection.order,
        });

        // Create items
        for (const item of currentSection.items) {
          await addDoc(collection(db, "docs"), {
            ...item,
            sectionId: sectionRef.id,
          });
        }
      }

      // Reset form and reload sections
      setCurrentSection({
        title: "",
        type: "public",
        order: 0,
        items: [
          {
            title: "",
            id: "",
            content: "",
            order: 0,
          },
        ],
      });
      setIsEditing(false);
      await loadSections();
    } catch (error) {
      console.error("Error saving section:", error);
    }
  };

  const handleEditSection = (section) => {
    setCurrentSection(section);
    setIsEditing(true);
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Delete this section and all its items?")) return;

    try {
      // Delete all items
      const itemsSnapshot = await getDocs(
        query(collection(db, "docs"), where("sectionId", "==", sectionId))
      );

      for (const doc of itemsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Delete section
      await deleteDoc(doc(db, "sections", sectionId));
      await loadSections();
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const handleFileUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const downloadURL = await uploadFile(file);

      const fileExtension = file.name.split(".").pop().toLowerCase();
      const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension);

      let markdownText = "";
      if (isVideo) {
        markdownText = `\n<video controls width="100%">\n  <source src="${downloadURL}" type="video/${fileExtension}">\n</video>\n`;
      } else {
        markdownText = `\n![${file.name}](${downloadURL})\n`;
      }

      handleItemChange(
        index,
        "content",
        (currentSection.items[index].content || "") + markdownText
      );
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminContainer>
      <BackButton onClick={() => navigate("/")}>
        ← Back to Documentation
      </BackButton>
      <AdminHeader>
        <h1>Documentation Manager</h1>
      </AdminHeader>

      <TabContainer>
        <TabList>
          <Tab active={activeTab === "new"} onClick={() => setActiveTab("new")}>
            Create New Section
          </Tab>
          <Tab
            active={activeTab === "existing"}
            onClick={() => {
              setActiveTab("existing");
              setIsEditing(false);
              setCurrentSection({
                title: "",
                type: "public",
                order: 0,
                items: [
                  {
                    title: "",
                    id: "",
                    content: "",
                    order: 0,
                  },
                ],
              });
            }}
          >
            Existing Sections
          </Tab>
        </TabList>

        {activeTab === "new" && !isEditing && (
          <Form onSubmit={handleSubmit}>
            <h2>Create New Section</h2>
            <FormGroup>
              <Label>Section Title</Label>
              <Input
                placeholder="e.g., Getting Started"
                value={currentSection.title}
                onChange={(e) =>
                  setCurrentSection((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Section Type</Label>
              <Select
                value={currentSection.type}
                onChange={(e) =>
                  setCurrentSection((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
              >
                <option value="public">Public</option>
                <option value="protected">Protected</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Display Order</Label>
              <Input
                type="number"
                placeholder="0"
                value={currentSection.order}
                onChange={(e) =>
                  setCurrentSection((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value),
                  }))
                }
              />
              <small
                style={{ color: "#666", marginTop: "0.5rem", display: "block" }}
              >
                Lower numbers appear first
              </small>
            </FormGroup>

            <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
              Content Items
            </h3>
            {currentSection.items.map((item, index) => (
              <SectionCard key={index}>
                <SectionHeader>
                  <h4>Item {index + 1}</h4>
                  {index > 0 && (
                    <AdminButton
                      type="button"
                      variant="secondary"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove Item
                    </AdminButton>
                  )}
                </SectionHeader>

                <FormGroup>
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Installation Guide"
                    value={item.title}
                    onChange={(e) =>
                      handleItemChange(index, "title", e.target.value)
                    }
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>URL Slug</Label>
                  <Input
                    placeholder="Auto-generated from title"
                    value={item.id}
                    disabled
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Media Upload</Label>
                  <div>
                    <FileUploadButton
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        document.getElementById(`fileUpload-${index}`).click()
                      }
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Media"}
                    </FileUploadButton>
                    <UploadInput
                      id={`fileUpload-${index}`}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e, index)}
                    />
                    <small>
                      Supported: Images (PNG, JPG, GIF) and Videos (MP4, WEBM,
                      OGG)
                    </small>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>Content</Label>
                  <EditorContainer>
                    <MDEditor
                      value={item.content}
                      onChange={(value) =>
                        handleItemChange(index, "content", value)
                      }
                      preview="edit"
                      height={400}
                    />
                  </EditorContainer>
                </FormGroup>
              </SectionCard>
            ))}

            <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
              <AdminButton
                type="button"
                variant="secondary"
                onClick={handleAddItem}
              >
                + Add Another Item
              </AdminButton>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              {isEditing && (
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentSection({
                      title: "",
                      type: "public",
                      order: 0,
                      items: [
                        {
                          title: "",
                          id: "",
                          content: "",
                          order: 0,
                        },
                      ],
                    });
                  }}
                >
                  Cancel
                </AdminButton>
              )}
              <AdminButton type="submit">
                {isEditing ? "Update Section" : "Create Section"}
              </AdminButton>
            </div>
          </Form>
        )}

        {(activeTab === "existing" || isEditing) && (
          <div>
            {isEditing ? (
              <Form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                  }}
                >
                  <h2>Edit Section: {currentSection.title}</h2>
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentSection({
                        title: "",
                        type: "public",
                        order: 0,
                        items: [
                          {
                            title: "",
                            id: "",
                            content: "",
                            order: 0,
                          },
                        ],
                      });
                    }}
                  >
                    Cancel Edit
                  </AdminButton>
                </div>
                <FormGroup>
                  <Label>Section Title</Label>
                  <Input
                    placeholder="e.g., Getting Started"
                    value={currentSection.title}
                    onChange={(e) =>
                      setCurrentSection((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Section Type</Label>
                  <Select
                    value={currentSection.type}
                    onChange={(e) =>
                      setCurrentSection((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                  >
                    <option value="public">Public</option>
                    <option value="protected">Protected</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={currentSection.order}
                    onChange={(e) =>
                      setCurrentSection((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value),
                      }))
                    }
                  />
                  <small
                    style={{
                      color: "#666",
                      marginTop: "0.5rem",
                      display: "block",
                    }}
                  >
                    Lower numbers appear first
                  </small>
                </FormGroup>

                <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                  Content Items
                </h3>
                {currentSection.items.map((item, index) => (
                  <SectionCard key={index}>
                    <SectionHeader>
                      <h4>Item {index + 1}</h4>
                      {index > 0 && (
                        <AdminButton
                          type="button"
                          variant="secondary"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove Item
                        </AdminButton>
                      )}
                    </SectionHeader>

                    <FormGroup>
                      <Label>Title</Label>
                      <Input
                        placeholder="e.g., Installation Guide"
                        value={item.title}
                        onChange={(e) =>
                          handleItemChange(index, "title", e.target.value)
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>URL Slug</Label>
                      <Input
                        placeholder="Auto-generated from title"
                        value={item.id}
                        disabled
                        style={{ backgroundColor: "#f5f5f5" }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Media Upload</Label>
                      <div>
                        <FileUploadButton
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            document
                              .getElementById(`fileUpload-${index}`)
                              .click()
                          }
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Upload Media"}
                        </FileUploadButton>
                        <UploadInput
                          id={`fileUpload-${index}`}
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleFileUpload(e, index)}
                        />
                        <small>
                          Supported: Images (PNG, JPG, GIF) and Videos (MP4,
                          WEBM, OGG)
                        </small>
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label>Content</Label>
                      <EditorContainer>
                        <MDEditor
                          value={item.content}
                          onChange={(value) =>
                            handleItemChange(index, "content", value)
                          }
                          preview="edit"
                          height={400}
                        />
                      </EditorContainer>
                    </FormGroup>
                  </SectionCard>
                ))}

                <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={handleAddItem}
                  >
                    + Add Another Item
                  </AdminButton>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1rem",
                  }}
                >
                  <AdminButton type="submit">Update Section</AdminButton>
                </div>
              </Form>
            ) : (
              <div>
                <h2 style={{ marginBottom: "2rem" }}>Existing Sections</h2>
                {sections.map((section) => (
                  <SectionCard key={section.id}>
                    <SectionHeader>
                      <div>
                        <h3
                          style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}
                        >
                          {section.title}
                        </h3>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "999px",
                            backgroundColor:
                              section.type === "public" ? "#e6f4ea" : "#fce8e8",
                            color:
                              section.type === "public" ? "#137333" : "#c5221f",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                          }}
                        >
                          {section.type}
                        </div>
                      </div>
                      <div>
                        <AdminButton
                          variant="secondary"
                          onClick={() => handleEditSection(section)}
                        >
                          Edit Section
                        </AdminButton>
                        <DeleteButton
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          Delete Section
                        </DeleteButton>
                      </div>
                    </SectionHeader>

                    <ItemsList>
                      {section.items.map((item, index) => (
                        <ItemCard key={item.firebaseId || index}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <div>
                              <h4
                                style={{
                                  fontSize: "1.1rem",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                {item.title}
                              </h4>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#666",
                                  display: "flex",
                                  gap: "1rem",
                                }}
                              >
                                <span>
                                  <strong>Slug:</strong> {item.id}
                                </span>
                                <span>
                                  <strong>Order:</strong> {item.order}
                                </span>
                              </div>
                              <div
                                style={{
                                  marginTop: "0.75rem",
                                  fontSize: "0.875rem",
                                  color: "#666",
                                  maxHeight: "3em",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {item.content?.substring(0, 150)}...
                              </div>
                            </div>
                          </div>
                        </ItemCard>
                      ))}
                      <div style={{ marginTop: "1rem" }}>
                        <AdminButton
                          variant="secondary"
                          onClick={() => {
                            handleEditSection({
                              ...section,
                              items: [
                                ...section.items,
                                {
                                  title: "",
                                  id: "",
                                  content: "",
                                  order: section.items.length,
                                },
                              ],
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          + Add Item to Section
                        </AdminButton>
                      </div>
                    </ItemsList>
                  </SectionCard>
                ))}
              </div>
            )}
          </div>
        )}
      </TabContainer>
    </AdminContainer>
  );
}
