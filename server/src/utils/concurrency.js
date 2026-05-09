/**
 * Update a document using optimistic concurrency based on updatedAt timestamp.
 * Returns the updated document or null if the update failed due to timestamp mismatch.
 *
 * Note: The caller should validate that `clientUpdatedAt` is present when strict timestamp
 * concurrency is required.
 */
export const updateByUpdatedAt = async (Model, filter, clientUpdatedAt, updateObj, options = {}) => {
  if (!clientUpdatedAt) {
    throw new Error('clientUpdatedAt is required');
  }
  const clientDate = new Date(clientUpdatedAt);
  if (Number.isNaN(clientDate.getTime())) {
    throw new Error('Invalid clientUpdatedAt');
  }

  // Use findOneAndUpdate and match the updatedAt timestamp to ensure only unchanged documents are updated.
  const updated = await Model.findOneAndUpdate(
    { ...filter, updatedAt: clientDate },
    { $set: updateObj },
    { new: true, ...options }
  );

  return updated;
};

// Small helper to attempt an unconditional update (useful for background processes like webhooks)
export const unconditionalUpdate = async (Model, filter, updateObj, options = {}) => {
  const updated = await Model.findOneAndUpdate(filter, { $set: updateObj }, { new: true, ...options });
  return updated;
};

export default { updateByUpdatedAt, unconditionalUpdate };
