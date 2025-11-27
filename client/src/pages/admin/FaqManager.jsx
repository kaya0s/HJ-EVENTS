import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuthStore } from "../../store/useAuthStore";
import useFaqStore from "../../store/useFaqStore";
import { Loader, Edit2, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  question: "",
  answer: "",
  order: 0,
};

const FaqManager = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const {
    faqs,
    isLoading,
    isSaving,
    fetchFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
  } = useFaqStore();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchFaqs();
  }, [authUser, navigate, fetchFaqs]);

  if (authUser?.role !== "admin") {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editingId) {
      await updateFaq(editingId, form);
    } else {
      await createFaq(form);
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      order: faq.order || 0,
      isPublished: faq.isPublished ?? true,
    });
  };

  const handleDelete = async (faqId) => {
    if (!confirm("Delete this FAQ?")) return;
    await deleteFaq(faqId);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">FAQ Management</h1>
            <p className="text-base-content/60">
              Create, edit, and publish frequently asked questions.
            </p>
          </header>

          <section className="card bg-base-100 shadow-lg">
            <div className="card-body space-y-4">
              <h2 className="card-title">
                {editingId ? "Edit FAQ" : "Add FAQ"}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Question</span>
                  </label>
                  <input
                    className="input input-bordered w-full"
                    placeholder="What is included in your packages?"
                    value={form.question}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, question: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Answer</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered min-h-24 w-full"
                    placeholder="Share the details..."
                    value={form.answer}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, answer: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Sort Order</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={form.order}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          order: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="form-control justify-end">
                    <label className="label cursor-pointer justify-start gap-4">
                      <span className="label-text font-medium">Published</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={form.isPublished ?? true}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            isPublished: e.target.checked,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      "Update FAQ"
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add FAQ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Existing FAQs</h2>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : faqs.length === 0 ? (
                <p className="text-base-content/60">
                  No FAQs yet. Add your first entry above.
                </p>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq._id}
                      className="rounded-lg border border-base-200 p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold">{faq.question}</p>
                          <p className="text-sm text-base-content/70 mt-1">
                            {faq.answer}
                          </p>
                          <p className="text-xs text-base-content/50 mt-2">
                            Order: {faq.order ?? 0} •{" "}
                            {faq.isPublished ? "Published" : "Hidden"}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleEdit(faq)}
                            type="button"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-error btn-ghost"
                            onClick={() => handleDelete(faq._id)}
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FaqManager;
