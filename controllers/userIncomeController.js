const Income = require('../models/incomeModel');
const User = require('../models/userModels');


const getUserIncome = async (request, response) => {
    const { userId } = request.params;

    try {
        const incomes = await Income.findAll({
            where: { user_id: userId },
            include: { model: User, as: 'user', attributes: ['username', 'email'] },
        });

        response.status(200).json(incomes);
    } catch (error) {
        console.error('Error fetching income records:', error);
        response.status(500).json({ message: 'Failed to fetch income records' });
    }
};


const createIncome = async (request, response) => {
    const { user_id } = request.params;
    const { amount, source, date_received } = request.body;

    try {
        const newIncome = await Income.create({ user_id, amount, source, date_received });
        response.status(201).json(newIncome);
    } catch (error) {
        console.error('Error creating income record:', error);
        response.status(500).json({ message: 'Failed to create income record' });
    }
};


const updateIncome = async (request, response) => {
    const { id } = request.params;
    const { amount, source, date_received } = request.body;

    try {
        const income = await Income.findByPk(id);

        if (!income) {
            return response.status(404).json({ message: 'Income record not found' });
        }

        income.amount = amount || income.amount;
        income.source = source || income.source;
        income.date_received = date_received || income.date_received;

        await income.save();
        response.status(200).json(income);
    } catch (error) {
        console.error('Error updating income record:', error);
        response.status(500).json({ message: 'Failed to update income record' });
    }
};

const deleteIncome = async (request, response) => {
    const { id } = request.params;

    try {
        const income = await Income.findByPk(id);

        if (!income) {
            return response.status(404).json({ message: 'Income record not found' });
        }

        await income.destroy();
        response.status(200).json({ message: 'Income record deleted successfully' });
    } catch (error) {
        console.error('Error deleting income record:', error);
        response.status(500).json({ message: 'Failed to delete income record' });
    }
};

module.exports = { getUserIncome, createIncome, updateIncome, deleteIncome };
