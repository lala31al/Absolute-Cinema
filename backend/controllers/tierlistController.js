const tierListModel = require('../models/tierListModel');

const createTierList = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { title, description } = req.body;

        if (!title) return res.status(400).json({ message: 'Title is required' });

        const id = await tierListModel.createTierList(user_id, title, description || '');
        res.json({ message: 'Tier list created', tier_list_id: id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create tier list', error: error.message });
    }
};

const getTierLists = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const lists = await tierListModel.getTierListsByUser(user_id);
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get tier lists', error: error.message });
    }
};

const getTierListById = async (req, res) => {
    try {
        const id = req.params.id;
        const tierList = await tierListModel.getTierListById(id);

        if (!tierList) return res.status(404).json({ message: 'Tier list not found' });

        res.json(tierList);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get tier list', error: error.message });
    }
};

const addFilmToTierList = async (req, res) => {
    try {
        const tier_list_id = req.params.id;
        const { film_id, position } = req.body;

        if (!film_id || position === undefined)
            return res.status(400).json({ message: 'film_id and position are required' });

        const id = await tierListModel.addFilmToTierList(tier_list_id, film_id, position);
        res.json({ message: 'Film added to tier list', tier_list_film_id: id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add film', error: error.message });
    }
};

const updateTierListFilmOrder = async (req, res) => {
    try {
        const tier_list_id = req.params.id;
        const { films } = req.body;

        if (!films || !films.length)
            return res.status(400).json({ message: 'Films array is required' });

        await tierListModel.updateTierListFilmOrder(tier_list_id, films);
        res.json({ message: 'Tier list order updated' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order', error: error.message });
    }
};

const deleteTierListController = async (req, res) => {
    try {
        const tier_list_id = req.params.id;

        const deleted = await tierListModel.deleteTierList(tier_list_id);

        if (!deleted) {
            return res.status(404).json({ message: 'Tier list not found' });
        }

        res.json({ message: 'Tier list deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete tier list', error: error.message });
    }
};

const deleteFilmFromTierListController = async (req, res) => {
    try {
        const tier_list_id = req.params.id;
        const film_id = req.params.film_id;

        const deleted = await tierListModel.deleteFilmFromTierList(tier_list_id, film_id);

        if (!deleted) {
            return res.status(404).json({ message: 'Film not found in tier list' });
        }

        res.json({ message: 'Film removed from tier list' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove film', error: error.message });
    }
};

module.exports = { createTierList, getTierLists,getTierListById,addFilmToTierList,updateTierListFilmOrder, deleteTierListController, deleteFilmFromTierListController};