import { Request, Response } from 'express';
import { FAQ } from '../models/faqModel';

// Get all FAQs
export const getAllFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await FAQ.find({ isActive: true })
      .sort({ category: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

// Get FAQ by ID
export const getFAQById = async (req: Request, res: Response) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ message: 'Error fetching FAQ' });
  }
};

// Create new FAQ
export const createFAQ = async (req: Request, res: Response) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Error creating FAQ' });
  }
};

// Update FAQ
export const updateFAQ = async (req: Request, res: Response) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Error updating FAQ' });
  }
};

// Delete FAQ (soft delete)
export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
};

// Search FAQs
export const searchFAQs = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const faqs = await FAQ.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { question: { $regex: query, $options: 'i' } },
            { answer: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).sort({ category: 1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error searching FAQs:', error);
    res.status(500).json({ message: 'Error searching FAQs' });
  }
}; 