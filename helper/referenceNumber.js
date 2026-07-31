import { sequelize } from "../models/index.js";
import RecognitionReferenceSequence from "../models/schema/recognition/reference_sequence.js";

export async function generateReferenceNumber() {
  const year = new Date().getFullYear();

  return sequelize.transaction(async (transaction) => {
    let sequenceRow = await RecognitionReferenceSequence.findOne({
      where: { year },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!sequenceRow) {
      sequenceRow = await RecognitionReferenceSequence.create(
        { year, last_sequence: 0 },
        { transaction }
      );
    }

    const nextSequence = sequenceRow.last_sequence + 1;
    await sequenceRow.update({ last_sequence: nextSequence }, { transaction });

    return `CARPI-${year}-${String(nextSequence).padStart(6, "0")}`;
  });
}
