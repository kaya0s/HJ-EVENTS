// components/BookingModal.jsx
const BookingModal = ({ package: pkg, isOpen, onClose, onBook }) => {
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventDate = formData.get("eventDate");
    const venue = formData.get("venue");

    if (!eventDate || !venue) {
      window.toast?.error("Please fill out all fields.");
      return;
    }

    await onBook({
      packageName: pkg.name,
      eventDate,
      venue,
    });

    onClose();
  };

  return (
    <dialog open={isOpen} className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          Book <span className="text-primary">{pkg.name}</span>
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Event Date</span>
            </div>
            <input
              type="date"
              name="eventDate"
              required
              className="input input-bordered w-full"
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Venue</span>
            </div>
            <input
              type="text"
              name="venue"
              required
              placeholder="Event venue"
              className="input input-bordered w-full"
            />
          </label>
          <div className="flex gap-3 justify-end pt-4">
            <button type="submit" className="btn btn-primary min-w-[110px]">
              Book Now
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* Backdrop click to close */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default BookingModal;
