const Income = require('../models/incomeModel');
const User = require('../models/userModels');

const getUserIncome = async (request, response) => {
    const { userId } = request.params;

    try {
        const incomeRecords = await Income.findAll({
            where: { user_id: userId },
            include: { model: User, as: 'user', attributes: ['username', 'email'] },
        });

        response.status(200).json(incomeRecords);
    } catch (error) {
        console.error('Error fetching income:', error);
        response.status(500).json({ message: 'Failed to fetch income' });
    }
};

const createIncome = async (request, response) => {
    const { user_id } = request.params;
    const { amount, source, date_received } = request.body;

    try {
        const newIncome = await Income.create({
            user_id,
            amount,
            source,
            date_received,
        });

        response.status(201).json(newIncome);
    } catch (error) {
        console.error('Error creating income:', error);
        response.status(500).json({ message: 'Failed to create income' });
    }
};

const updateIncome = async (request, response) => {
    const { id } = request.params;
    const { amount, source, date_received } = request.body;

    try {
        const income = await Income.findByPk(id);

        if (!income) {
            return response.status(404).json({ message: 'Income not found' });
        }

        // Update fields
        income.amount = amount ?? income.amount;
        income.source = source ?? income.source;
        income.date_received = date_received ?? income.date_received;

        await income.save();
        response.status(200).json(income);
    } catch (error) {
        console.error('Error updating income:', error);
        response.status(500).json({ message: 'Failed to update income' });
    }
};

const deleteIncome = async (request, response) => {
    const { id } = request.params;

    try {
        const income = await Income.findByPk(id);

        if (!income) {
            return response.status(404).json({ message: 'Income not found' });
        }

        await income.destroy();
        response.status(200).json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        response.status(500).json({ message: 'Failed to delete income' });
    }
};

module.exports = { getUserIncome, createIncome, updateIncome, deleteIncome };
