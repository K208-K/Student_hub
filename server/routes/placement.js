const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Placement data is mostly static - served from API
router.get('/aptitude', auth, (req, res) => {
  const questions = [
    { id: 1, question: 'A train 150m long passes a pole in 15 seconds. What is its speed?', options: ['10 m/s', '15 m/s', '20 m/s', '25 m/s'], answer: 0, explanation: 'Speed = Distance/Time = 150/15 = 10 m/s' },
    { id: 2, question: 'If 6 men can do a piece of work in 20 days, how many men are needed to do it in 12 days?', options: ['8', '10', '12', '15'], answer: 1, explanation: '6 × 20 = x × 12; x = 120/12 = 10 men' },
    { id: 3, question: 'The average of first 50 natural numbers is:', options: ['25', '25.5', '26', '26.5'], answer: 1, explanation: 'Average = (n+1)/2 = 51/2 = 25.5' },
    { id: 4, question: 'A shopkeeper sells an article at 20% profit. If he had bought it at 10% less, his profit would be?', options: ['25%', '30%', '33.33%', '35%'], answer: 2, explanation: 'CP=100, SP=120. New CP=90. Profit = (120-90)/90 × 100 = 33.33%' },
    { id: 5, question: 'What is the HCF of 36 and 48?', options: ['6', '8', '12', '24'], answer: 2, explanation: '36 = 2² × 3²; 48 = 2⁴ × 3; HCF = 2² × 3 = 12' },
    { id: 6, question: 'A car covers 360 km in 4 hours. What is the speed in m/s?', options: ['20', '25', '30', '35'], answer: 1, explanation: 'Speed = 360/4 = 90 km/h = 90 × 5/18 = 25 m/s' },
    { id: 7, question: 'If x + 1/x = 5, what is x² + 1/x²?', options: ['23', '25', '27', '29'], answer: 0, explanation: '(x + 1/x)² = x² + 2 + 1/x² = 25; So x² + 1/x² = 23' },
    { id: 8, question: 'A pipe can fill a tank in 6 hours. Another pipe can empty it in 8 hours. If both are opened, how long to fill?', options: ['20h', '22h', '24h', '26h'], answer: 2, explanation: 'Net rate = 1/6 - 1/8 = 1/24. Time = 24 hours' },
  ];
  res.json(questions);
});

router.get('/interview-questions', auth, (req, res) => {
  const questions = [
    { category: 'Technical', questions: [
      'Explain the difference between stack and heap memory.',
      'What is the time complexity of quicksort?',
      'Explain ACID properties in databases.',
      'What is the difference between TCP and UDP?',
      'Explain the concept of Virtual Memory.',
    ]},
    { category: 'HR', questions: [
      'Tell me about yourself.',
      'What are your strengths and weaknesses?',
      'Where do you see yourself in 5 years?',
      'Why should we hire you?',
      'Describe a challenging situation you have faced.',
    ]},
    { category: 'Coding', questions: [
      'Reverse a linked list',
      'Find the missing number in an array of 1 to N',
      'Implement binary search',
      'Check if a string is palindrome',
      'Find the maximum subarray sum (Kadane\'s algorithm)',
    ]},
  ];
  res.json(questions);
});

module.exports = router;
