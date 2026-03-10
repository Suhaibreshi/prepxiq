import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

interface QuizData {
  [key: string]: {
    [key: string]: Question[];
  };
}

const class6Questions = {
  'Mathematics': [
    // Basic Arithmetic
    { question: 'What is 15 + 27?', options: ['42', '40', '45', '38'], correctAnswer: 0, topic: 'Basic Arithmetic' },
    { question: 'What is 50 - 23?', options: ['25', '27', '30', '35'], correctAnswer: 1, topic: 'Basic Arithmetic' },
    { question: 'What is 12 × 8?', options: ['86', '92', '96', '100'], correctAnswer: 2, topic: 'Basic Arithmetic' },
    { question: 'What is 144 ÷ 12?', options: ['10', '12', '14', '16'], correctAnswer: 1, topic: 'Basic Arithmetic' },
    { question: 'What is 25 + 18 + 7?', options: ['50', '48', '52', '55'], correctAnswer: 0, topic: 'Basic Arithmetic' },
    { question: 'What is 100 - 37?', options: ['63', '65', '67', '69'], correctAnswer: 0, topic: 'Basic Arithmetic' },
    { question: 'What is 7 × 9?', options: ['61', '62', '63', '65'], correctAnswer: 2, topic: 'Basic Arithmetic' },
    { question: 'What is 36 ÷ 6?', options: ['5', '6', '7', '8'], correctAnswer: 1, topic: 'Basic Arithmetic' },
    { question: 'What is 99 + 1?', options: ['99', '100', '101', '102'], correctAnswer: 1, topic: 'Basic Arithmetic' },
    { question: 'What is 88 - 45?', options: ['43', '44', '45', '46'], correctAnswer: 0, topic: 'Basic Arithmetic' },
    // Numbers and Place Value
    { question: 'What is the place value of 5 in 567?', options: ['5', '50', '500', '5000'], correctAnswer: 2, topic: 'Numbers and Place Value' },
    { question: 'Write 1256 in words:', options: ['One thousand two hundred fifty six', 'Twelve hundred fifty six', 'One thousand twenty-five', 'One lakh two hundred fifty six'], correctAnswer: 0, topic: 'Numbers and Place Value' },
    { question: 'Which is the smallest number? 345, 354, 435, 453', options: ['345', '354', '435', '453'], correctAnswer: 0, topic: 'Numbers and Place Value' },
    { question: 'What comes after 999?', options: ['900', '1000', '1001', '1099'], correctAnswer: 1, topic: 'Numbers and Place Value' },
    { question: 'What is the digit in the hundreds place in 3456?', options: ['3', '4', '5', '6'], correctAnswer: 2, topic: 'Numbers and Place Value' },
    // Fractions
    { question: 'What is 1/2 + 1/4?', options: ['1/6', '2/4', '3/4', '2/6'], correctAnswer: 2, topic: 'Fractions' },
    { question: 'What is 3/4 in decimal?', options: ['0.5', '0.75', '0.25', '1.2'], correctAnswer: 1, topic: 'Fractions' },
    { question: 'Which fraction is the largest? 1/2, 1/3, 1/4, 1/5', options: ['1/2', '1/3', '1/4', '1/5'], correctAnswer: 0, topic: 'Fractions' },
    { question: 'What is 1/2 of 20?', options: ['5', '10', '15', '20'], correctAnswer: 1, topic: 'Fractions' },
    { question: 'What is 2/5 of 25?', options: ['5', '10', '15', '20'], correctAnswer: 1, topic: 'Fractions' },
    // Geometry
    { question: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correctAnswer: 1, topic: 'Basic Geometry' },
    { question: 'How many sides does a square have?', options: ['3', '4', '5', '6'], correctAnswer: 1, topic: 'Basic Geometry' },
    { question: 'What is the perimeter of a square with side 5cm?', options: ['10', '15', '20', '25'], correctAnswer: 2, topic: 'Basic Geometry' },
    { question: 'What is the area of a rectangle with length 6 and width 4?', options: ['10', '20', '24', '30'], correctAnswer: 2, topic: 'Basic Geometry' },
    { question: 'How many degrees are in a right angle?', options: ['45°', '60°', '90°', '180°'], correctAnswer: 2, topic: 'Basic Geometry' },
    // Multiples and Factors
    { question: 'What is the smallest multiple of 6?', options: ['1', '2', '3', '6'], correctAnswer: 3, topic: 'Multiples and Factors' },
    { question: 'Which is a factor of 20?', options: ['3', '4', '6', '7'], correctAnswer: 1, topic: 'Multiples and Factors' },
    { question: 'What are the factors of 12?', options: ['1,2,3,4,6,12', '1,2,4,8', '2,3,4,6', '1,3,5,9'], correctAnswer: 0, topic: 'Multiples and Factors' },
    { question: 'Is 17 prime or composite?', options: ['Prime', 'Composite', 'Neither', 'Both'], correctAnswer: 0, topic: 'Multiples and Factors' },
    { question: 'What is the LCM of 4 and 6?', options: ['10', '12', '14', '16'], correctAnswer: 1, topic: 'Multiples and Factors' },
    // Word Problems
    { question: 'Ram has 15 apples and Shyam has 8 apples. How many more apples does Ram have?', options: ['5', '7', '23', '25'], correctAnswer: 1, topic: 'Word Problems' },
    { question: 'A book costs ₹50 and a pen costs ₹10. What is the total cost?', options: ['₹40', '₹50', '₹60', '₹70'], correctAnswer: 2, topic: 'Word Problems' },
    { question: 'If one notebook costs ₹25, what is the cost of 4 notebooks?', options: ['₹75', '₹90', '₹100', '₹125'], correctAnswer: 3, topic: 'Word Problems' },
    { question: 'A baker made 120 cookies. He packed them in boxes of 12. How many boxes did he need?', options: ['8', '10', '12', '15'], correctAnswer: 1, topic: 'Word Problems' },
    { question: 'Priya scored 85 marks out of 100 in Math and 92 in English. What is her total score?', options: ['170', '177', '185', '190'], correctAnswer: 1, topic: 'Word Problems' },
  ],
  'Science': [
    // Living Things
    { question: 'What is the basic unit of life?', options: ['Tissue', 'Organ', 'Cell', 'Organism'], correctAnswer: 2, topic: 'Living Things' },
    { question: 'Which of these is a living thing?', options: ['Rock', 'Water', 'Tree', 'Air'], correctAnswer: 2, topic: 'Living Things' },
    { question: 'How many legs does an insect have?', options: ['4', '6', '8', '10'], correctAnswer: 1, topic: 'Living Things' },
    { question: 'What do plants use to make food?', options: ['Water and soil', 'Sunlight and water', 'Air and soil', 'Soil and nutrients'], correctAnswer: 1, topic: 'Living Things' },
    { question: 'Which organ in human body pumps blood?', options: ['Lungs', 'Brain', 'Heart', 'Liver'], correctAnswer: 2, topic: 'Living Things' },
    // Elements and Compounds
    { question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctAnswer: 2, topic: 'Elements' },
    { question: 'What is the chemical symbol for Silver?', options: ['Si', 'S', 'Ag', 'Au'], correctAnswer: 2, topic: 'Elements' },
    { question: 'What is the chemical symbol for Oxygen?', options: ['O', 'O₂', 'Ox', 'Og'], correctAnswer: 0, topic: 'Elements' },
    { question: 'How many elements are in the periodic table?', options: ['50+', '100+', '110+', '118+'], correctAnswer: 3, topic: 'Elements' },
    { question: 'Which metal is liquid at room temperature?', options: ['Iron', 'Gold', 'Mercury', 'Silver'], correctAnswer: 2, topic: 'Elements' },
    // Earth and Space
    { question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correctAnswer: 1, topic: 'Earth and Space' },
    { question: 'What is the largest planet?', options: ['Saturn', 'Jupiter', 'Neptune', 'Earth'], correctAnswer: 1, topic: 'Earth and Space' },
    { question: 'Which planet is closest to the sun?', options: ['Venus', 'Mercury', 'Mars', 'Earth'], correctAnswer: 1, topic: 'Earth and Space' },
    { question: 'What causes day and night?', options: ['Moon', 'Rotation of Earth', 'Revolution of Earth', 'Sun'], correctAnswer: 1, topic: 'Earth and Space' },
    { question: 'What is the shape of Earth?', options: ['Flat', 'Cube', 'Sphere', 'Oval'], correctAnswer: 2, topic: 'Earth and Space' },
    // Materials
    { question: 'What are the three states of matter?', options: ['Solid and Liquid', 'Liquid and Gas', 'Solid, Liquid, and Gas', 'Only Solid'], correctAnswer: 2, topic: 'Materials and Matter' },
    { question: 'Which material floats in water?', options: ['Iron', 'Stone', 'Wood', 'Glass'], correctAnswer: 2, topic: 'Materials and Matter' },
    { question: 'What is the melting point of ice?', options: ['0°C', '100°C', '50°C', '-10°C'], correctAnswer: 0, topic: 'Materials and Matter' },
    { question: 'What is the boiling point of water?', options: ['0°C', '50°C', '100°C', '150°C'], correctAnswer: 2, topic: 'Materials and Matter' },
    { question: 'Which is a pure substance?', options: ['Air', 'Milk', 'Soil', 'Gold'], correctAnswer: 3, topic: 'Materials and Matter' },
    // Energy
    { question: 'What is energy?', options: ['A type of matter', 'Ability to do work', 'A chemical', 'A force'], correctAnswer: 1, topic: 'Energy' },
    { question: 'Which is a renewable energy source?', options: ['Coal', 'Oil', 'Solar', 'Natural Gas'], correctAnswer: 2, topic: 'Energy' },
    { question: 'What is the source of Solar energy?', options: ['Moon', 'Earth', 'Sun', 'Star'], correctAnswer: 2, topic: 'Energy' },
    { question: 'Which energy is produced by moving water?', options: ['Solar', 'Wind', 'Hydro', 'Biomass'], correctAnswer: 2, topic: 'Energy' },
    { question: 'What happens to energy?', options: ['Created', 'Destroyed', 'Transferred or transformed', 'Disappears'], correctAnswer: 2, topic: 'Energy' },
  ],
  'English': [
    // Nouns
    { question: 'Which word is a noun?', options: ['Run', 'Quick', 'Book', 'Very'], correctAnswer: 2, topic: 'Nouns' },
    { question: 'What is the plural of "child"?', options: ['Childs', 'Children', 'Childes', 'Childies'], correctAnswer: 1, topic: 'Nouns' },
    { question: 'What is the plural of "cat"?', options: ['Cat', 'Cats', 'Cates', 'Cates'], correctAnswer: 1, topic: 'Nouns' },
    { question: 'Which is a common noun?', options: ['Priya', 'India', 'Dog', 'Both A and B'], correctAnswer: 2, topic: 'Nouns' },
    { question: 'Which is a proper noun?', options: ['Girl', 'Boy', 'Mumbai', 'Country'], correctAnswer: 2, topic: 'Nouns' },
    // Verbs and Tenses
    { question: 'Which word is a verb?', options: ['Happy', 'Running', 'Blue', 'Beautiful'], correctAnswer: 1, topic: 'Verbs' },
    { question: 'What is the past tense of "Go"?', options: ['Goed', 'Gone', 'Went', 'Going'], correctAnswer: 2, topic: 'Verbs and Tenses' },
    { question: 'What is the past tense of "Do"?', options: ['Did', 'Done', 'Doing', 'Doest'], correctAnswer: 0, topic: 'Verbs and Tenses' },
    { question: 'What is the past tense of "Eat"?', options: ['Eated', 'Eaten', 'Ate', 'Eating'], correctAnswer: 2, topic: 'Verbs and Tenses' },
    { question: 'He ___ to school every day. (Fill in the blank)', options: ['Going', 'Goes', 'Go', 'Went'], correctAnswer: 1, topic: 'Verbs and Tenses' },
    // Adjectives
    { question: 'Which word is an adjective?', options: ['Quickly', 'Beautiful', 'Run', 'Walk'], correctAnswer: 1, topic: 'Adjectives' },
    { question: 'What is the comparative form of "big"?', options: ['Bigger', 'Biggest', 'More big', 'Most big'], correctAnswer: 0, topic: 'Adjectives' },
    { question: 'What is the superlative form of "small"?', options: ['Smaller', 'Smallest', 'More small', 'Most small'], correctAnswer: 1, topic: 'Adjectives' },
    { question: 'Which sentence has an adjective?', options: ['He runs fast', 'She is beautiful', 'They play', 'I eat food'], correctAnswer: 1, topic: 'Adjectives' },
    { question: 'The ___ dog is sleeping. (Fill with adjective)', options: ['Sleep', 'Sleeping', 'Brown', 'Sleep'], correctAnswer: 2, topic: 'Adjectives' },
    // Sentence Structure
    { question: 'Select the correct sentence:', options: ['She go school', 'She goes to school', 'She going school', 'She gone school'], correctAnswer: 1, topic: 'Sentence Structure' },
    { question: 'What is the subject in "The cat sat on the mat"?', options: ['Cat', 'The cat', 'Sat', 'The mat'], correctAnswer: 1, topic: 'Sentence Structure' },
    { question: 'What is the predicate in "She plays cricket"?', options: ['She', 'Plays', 'Plays cricket', 'Cricket'], correctAnswer: 2, topic: 'Sentence Structure' },
    { question: 'Which is an interrogative sentence?', options: ['She is happy', 'Be quiet', 'What is your name?', 'He left'], correctAnswer: 2, topic: 'Sentence Structure' },
    { question: 'Which is an imperative sentence?', options: ['Go away', 'He went away', 'Is he going?', 'He will go'], correctAnswer: 0, topic: 'Sentence Structure' },
    // Vocabulary
    { question: 'What is the synonym of "Happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctAnswer: 1, topic: 'Vocabulary' },
    { question: 'What is the antonym of "Hot"?', options: ['Warm', 'Cold', 'Heat', 'Fire'], correctAnswer: 1, topic: 'Vocabulary' },
    { question: 'What does "Generous" mean?', options: ['Selfish', 'Giving', 'Lazy', 'Angry'], correctAnswer: 1, topic: 'Vocabulary' },
    { question: 'What does "Brave" mean?', options: ['Fearful', 'Courageous', 'Weak', 'Scared'], correctAnswer: 1, topic: 'Vocabulary' },
    { question: 'Which word means "very small"?', options: ['Huge', 'Tiny', 'Large', 'Big'], correctAnswer: 1, topic: 'Vocabulary' },
  ]
};

const class9Questions = {
  'Mathematics': [
    // Linear Equations
    { question: 'If 2x + 5 = 13, what is x?', options: ['2', '3', '4', '5'], correctAnswer: 2, topic: 'Linear Equations' },
    { question: 'If 3x - 7 = 2, what is x?', options: ['1', '2', '3', '4'], correctAnswer: 2, topic: 'Linear Equations' },
    { question: 'If x/2 + 3 = 7, what is x?', options: ['4', '6', '8', '10'], correctAnswer: 2, topic: 'Linear Equations' },
    { question: 'Solve: 5x - 10 = 0', options: ['0', '1', '2', '3'], correctAnswer: 2, topic: 'Linear Equations' },
    { question: 'If 4x + 6 = 22, what is x?', options: ['2', '3', '4', '5'], correctAnswer: 3, topic: 'Linear Equations' },
    { question: 'If 2x - 8 = 12, what is x?', options: ['8', '10', '12', '14'], correctAnswer: 1, topic: 'Linear Equations' },
    { question: 'If x + x/2 = 9, what is x?', options: ['4', '5', '6', '7'], correctAnswer: 2, topic: 'Linear Equations' },
    { question: 'If 7x = 49, what is x?', options: ['5', '6', '7', '8'], correctAnswer: 2, topic: 'Linear Equations' },
    { question: 'If 3x + 4 = 25, what is x?', options: ['5', '6', '7', '8'], correctAnswer: 2, topic: 'Linear Equations' },
    { question: 'If (x+5)/3 = 4, what is x?', options: ['5', '7', '9', '11'], correctAnswer: 1, topic: 'Linear Equations' },
    // Geometry
    { question: 'What is the area of a triangle with base 10 and height 8?', options: ['40', '80', '20', '100'], correctAnswer: 0, topic: 'Area and Volume' },
    { question: 'What is the circumference of a circle with radius 7?', options: ['14π', '49π', '7π', '21π'], correctAnswer: 0, topic: 'Area and Volume' },
    { question: 'What is the area of a circle with radius 5?', options: ['10π', '25π', '50π', '100π'], correctAnswer: 1, topic: 'Area and Volume' },
    { question: 'What is the volume of a cube with side 4?', options: ['16', '32', '64', '128'], correctAnswer: 2, topic: 'Area and Volume' },
    { question: 'What is the volume of a rectangular box with dimensions 3, 4, and 5?', options: ['12', '20', '60', '120'], correctAnswer: 2, topic: 'Area and Volume' },
    { question: 'Sum of angles in a triangle is:', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1, topic: 'Geometry Fundamentals' },
    { question: 'Sum of angles in a quadrilateral is:', options: ['180°', '270°', '360°', '450°'], correctAnswer: 2, topic: 'Geometry Fundamentals' },
    { question: 'What is a right angle?', options: ['45°', '60°', '90°', '180°'], correctAnswer: 2, topic: 'Geometry Fundamentals' },
    { question: 'What is an obtuse angle?', options: ['Less than 90°', 'Between 90° and 180°', 'More than 180°', 'Exactly 90°'], correctAnswer: 1, topic: 'Geometry Fundamentals' },
    { question: 'In a right triangle, if two sides are 3 and 4, what is the hypotenuse?', options: ['5', '6', '7', '8'], correctAnswer: 0, topic: 'Pythagoras Theorem' },
    // Polynomials
    { question: 'What is the degree of polynomial 3x² + 2x + 1?', options: ['1', '2', '3', '5'], correctAnswer: 1, topic: 'Polynomials' },
    { question: 'What is the leading coefficient of 4x³ + 3x² + 2?', options: ['2', '3', '4', '7'], correctAnswer: 2, topic: 'Polynomials' },
    { question: 'Expand (x + 2)(x - 3):', options: ['x² - x - 6', 'x² - 5x - 6', 'x² + x - 6', 'x² + 5x + 6'], correctAnswer: 0, topic: 'Polynomials' },
    { question: 'Factorize x² - 9:', options: ['(x-3)²', '(x+3)²', '(x+3)(x-3)', '(x+9)(x-1)'], correctAnswer: 2, topic: 'Polynomials' },
    { question: 'What is the value of (a + b)²?', options: ['a² + b²', 'a² + 2ab + b²', 'a² - b²', 'a + b²'], correctAnswer: 1, topic: 'Polynomials' },
    // Statistics
    { question: 'What is the mean of 2, 4, 6, 8?', options: ['4', '5', '6', '7'], correctAnswer: 1, topic: 'Statistics' },
    { question: 'What is the median of 1, 3, 5, 7, 9?', options: ['1', '5', '7', '9'], correctAnswer: 1, topic: 'Statistics' },
    { question: 'What is the mode of 2, 2, 3, 4, 4, 4, 5?', options: ['2', '3', '4', '5'], correctAnswer: 2, topic: 'Statistics' },
    { question: 'What is the range of 10, 20, 30, 40, 50?', options: ['20', '30', '40', '50'], correctAnswer: 3, topic: 'Statistics' },
    { question: 'Average of 10, 20, 30 is:', options: ['10', '20', '30', '60'], correctAnswer: 1, topic: 'Statistics' },
  ],
  'Science': [
    // Atomic Structure
    { question: 'What is the atomic number of carbon?', options: ['4', '6', '8', '10'], correctAnswer: 1, topic: 'Atomic Structure' },
    { question: 'What is an atom?', options: ['Smallest particle of element', 'Smallest particle of compound', 'Neutral particle', 'All of above'], correctAnswer: 3, topic: 'Atomic Structure' },
    { question: 'Protons are found in the:', options: ['Nucleus', 'Electron shell', 'Orbitals', 'None'], correctAnswer: 0, topic: 'Atomic Structure' },
    { question: 'Which has no charge?', options: ['Proton', 'Electron', 'Neutron', 'Ion'], correctAnswer: 2, topic: 'Atomic Structure' },
    { question: 'What is the charge of an electron?', options: ['Positive', 'Negative', 'Neutral', 'No charge'], correctAnswer: 1, topic: 'Atomic Structure' },
    // Periodic Table
    { question: 'How many groups are in the periodic table?', options: ['16', '18', '20', '22'], correctAnswer: 1, topic: 'Periodic Table' },
    { question: 'Which element is in group 17?', options: ['Oxygen', 'Chlorine', 'Nitrogen', 'Carbon'], correctAnswer: 1, topic: 'Periodic Table' },
    { question: 'Which is a noble gas?', options: ['Helium', 'Nitrogen', 'Oxygen', 'Hydrogen'], correctAnswer: 0, topic: 'Periodic Table' },
    { question: 'Chemical symbol of Iron is:', options: ['Ir', 'I', 'Fe', 'In'], correctAnswer: 2, topic: 'Periodic Table' },
    { question: 'Which element is liquid at room temperature?', options: ['Iron', 'Mercury', 'Gold', 'Silver'], correctAnswer: 1, topic: 'Periodic Table' },
    // Chemical Reactions
    { question: 'What is a chemical reaction?', options: ['Change in position', 'Change in state', 'Formation of new substances', 'Movement'], correctAnswer: 2, topic: 'Chemical Reactions' },
    { question: 'Which is a physical change?', options: ['Burning', 'Rusting', 'Melting', 'Photosynthesis'], correctAnswer: 2, topic: 'Chemical Reactions' },
    { question: 'Which is a chemical change?', options: ['Melting ice', 'Dissolving salt', 'Burning paper', 'Cutting wood'], correctAnswer: 2, topic: 'Chemical Reactions' },
    { question: 'What produces energy in exothermic reactions?', options: ['Absorbs', 'Releases', 'Stores', 'Converts'], correctAnswer: 1, topic: 'Chemical Reactions' },
    { question: 'Combustion requires:', options: ['Fuel', 'Oxygen', 'Heat', 'All of above'], correctAnswer: 3, topic: 'Chemical Reactions' },
    // Force and Motion
    { question: 'What is SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 1, topic: 'Force and Motion' },
    { question: 'Newton first law states:', options: ['F=ma', 'Action=Reaction', 'Object continues unless forced', 'Velocity is constant'], correctAnswer: 2, topic: 'Force and Motion' },
    { question: 'What is acceleration?', options: ['Rate of position change', 'Rate of velocity change', 'Rate of speed', 'Total distance'], correctAnswer: 1, topic: 'Force and Motion' },
    { question: 'Friction acts:', options: ['With motion', 'Against motion', 'Perpendicular', 'Upward'], correctAnswer: 1, topic: 'Force and Motion' },
    { question: 'Weight is force due to:', options: ['Friction', 'Gravity', 'Air resistance', 'Speed'], correctAnswer: 1, topic: 'Force and Motion' },
    // Waves
    { question: 'What is wavelength?', options: ['Time between waves', 'Height of wave', 'Distance between peaks', 'Speed of wave'], correctAnswer: 2, topic: 'Waves' },
    { question: 'Speed of sound in air is approximately:', options: ['300 m/s', '340 m/s', '3×10⁸ m/s', '1000 m/s'], correctAnswer: 1, topic: 'Waves' },
    { question: 'Which is a transverse wave?', options: ['Sound', 'Light', 'Water ripple', 'Compression'], correctAnswer: 2, topic: 'Waves' },
    { question: 'Frequency is measured in:', options: ['Hertz', 'Newton', 'Volt', 'Joule'], correctAnswer: 0, topic: 'Waves' },
    { question: 'Relation between velocity, frequency and wavelength:', options: ['v = f × λ', 'v = f + λ', 'v = f / λ', 'v = f - λ'], correctAnswer: 0, topic: 'Waves' },
  ]
};

const class12Questions = {
  'Mathematics': [
    // Calculus
    { question: 'What is the derivative of x²?', options: ['x', '2x', 'x+1', '2x+1'], correctAnswer: 1, topic: 'Calculus' },
    { question: 'What is the derivative of 5x³?', options: ['5x²', '10x²', '15x²', '20x²'], correctAnswer: 2, topic: 'Calculus' },
    { question: 'What is the derivative of sin(x)?', options: ['sin(x)', 'cos(x)', '-sin(x)', '-cos(x)'], correctAnswer: 1, topic: 'Calculus' },
    { question: 'What is the integral of x?', options: ['1', 'x', 'x²/2 + C', 'x+1'], correctAnswer: 2, topic: 'Calculus' },
    { question: 'What is the value of ∫₀¹ x dx?', options: ['0', '0.5', '1', '2'], correctAnswer: 1, topic: 'Calculus' },
    // Logarithms
    { question: 'What is log₁₀(100)?', options: ['1', '2', '10', '100'], correctAnswer: 1, topic: 'Logarithms' },
    { question: 'What is log₂(8)?', options: ['2', '3', '4', '8'], correctAnswer: 1, topic: 'Logarithms' },
    { question: 'What is ln(e)?', options: ['0', '1', 'e', 'undefined'], correctAnswer: 1, topic: 'Logarithms' },
    { question: 'If log(x) = 2, then x = ?', options: ['2', '10', '100', '1000'], correctAnswer: 2, topic: 'Logarithms' },
    { question: 'log(ab) = ?', options: ['log(a) + log(b)', 'log(a) - log(b)', 'log(a) × log(b)', 'log(a) / log(b)'], correctAnswer: 0, topic: 'Logarithms' },
    // Trigonometry
    { question: 'sin²(x) + cos²(x) = ?', options: ['0', '1', 'sin(2x)', 'cos(2x)'], correctAnswer: 1, topic: 'Trigonometry' },
    { question: 'What is sin(90°)?', options: ['0', '1', '-1', 'undefined'], correctAnswer: 1, topic: 'Trigonometry' },
    { question: 'What is cos(0°)?', options: ['0', '1', '-1', 'undefined'], correctAnswer: 1, topic: 'Trigonometry' },
    { question: 'tan(x) = ?', options: ['sin(x) + cos(x)', 'sin(x) / cos(x)', 'cos(x) / sin(x)', 'sin(x) × cos(x)'], correctAnswer: 1, topic: 'Trigonometry' },
    { question: 'What is tan(45°)?', options: ['0', '1', '-1', 'undefined'], correctAnswer: 1, topic: 'Trigonometry' },
    // Sequences and Series
    { question: 'What is the sum of arithmetic series: 1 + 2 + 3 + ... + 10?', options: ['45', '50', '55', '60'], correctAnswer: 2, topic: 'Sequences and Series' },
    { question: 'In AP with a=1, d=2, what is the 5th term?', options: ['7', '8', '9', '10'], correctAnswer: 2, topic: 'Sequences and Series' },
    { question: 'Sum of infinite GP with a=1, r=1/2 is:', options: ['1', '2', 'infinity', 'undefined'], correctAnswer: 1, topic: 'Sequences and Series' },
    { question: 'What is the common ratio in 2, 4, 8, 16?', options: ['1', '2', '3', '4'], correctAnswer: 1, topic: 'Sequences and Series' },
    { question: 'If a,b,c are in AP, then 2b = ?', options: ['a + c', 'a - c', 'ac', 'a/c'], correctAnswer: 0, topic: 'Sequences and Series' },
    // Matrices and Determinants
    { question: 'What is the order of matrix with 3 rows and 2 columns?', options: ['2×3', '3×2', '2+3', '3-2'], correctAnswer: 1, topic: 'Matrices' },
    { question: 'What is the determinant of [[1,0],[0,1]]?', options: ['0', '1', '2', '-1'], correctAnswer: 1, topic: 'Matrices' },
    { question: 'Transpose of [[1,2],[3,4]] is:', options: ['[[1,3],[2,4]]', '[[2,1],[4,3]]', '[[4,3],[2,1]]', '[[1,2],[3,4]]'], correctAnswer: 0, topic: 'Matrices' },
    { question: 'Identity matrix multiplied by any matrix gives:', options: ['0', 'Same matrix', 'Inverse', 'Transpose'], correctAnswer: 1, topic: 'Matrices' },
    { question: 'What is A + A^T for symmetric matrix?', options: ['0', '2A', 'A', 'A²'], correctAnswer: 1, topic: 'Matrices' },
    // Complex Numbers
    { question: 'What is i² (where i is imaginary unit)?', options: ['1', '-1', 'i', '-i'], correctAnswer: 1, topic: 'Complex Numbers' },
    { question: 'What is (1+i)²?', options: ['1+i', '2i', '-1+2i', '2+2i'], correctAnswer: 2, topic: 'Complex Numbers' },
    { question: 'Modulus of 3+4i is:', options: ['3', '4', '5', '7'], correctAnswer: 2, topic: 'Complex Numbers' },
    { question: 'Conjugate of 2-3i is:', options: ['2+3i', '-2-3i', '2-3i', '-2+3i'], correctAnswer: 0, topic: 'Complex Numbers' },
    { question: '(1+i)/(1-i) = ?', options: ['0', 'i', '-i', '1'], correctAnswer: 1, topic: 'Complex Numbers' },
  ],
  'Physics': [
    // Mechanics
    { question: 'What is the SI unit of velocity?', options: ['m/s', 'm/s²', 'km/h', 'm'], correctAnswer: 0, topic: 'Mechanics' },
    { question: 'A car accelerates from 0 to 10 m/s in 5s. Acceleration is:', options: ['0.5 m/s²', '1 m/s²', '2 m/s²', '5 m/s²'], correctAnswer: 2, topic: 'Mechanics' },
    { question: 'What is momentum?', options: ['m/v', 'm×v', 'm+v', 'm-v'], correctAnswer: 1, topic: 'Mechanics' },
    { question: 'Newtons second law states:', options: ['F=ma', 'F=m+a', 'F=m/a', 'F=a/m'], correctAnswer: 0, topic: 'Mechanics' },
    { question: 'If mass is 5 kg and acceleration is 2 m/s², force is:', options: ['5N', '10N', '15N', '20N'], correctAnswer: 1, topic: 'Mechanics' },
    // Waves and Optics
    { question: 'Speed of light in vacuum is:', options: ['3×10⁸ m/s', '3×10⁹ m/s', '3×10⁷ m/s', '3×10¹⁰ m/s'], correctAnswer: 0, topic: 'Waves and Optics' },
    { question: 'What is a virtual image?', options: ['Real and inverted', 'Upright and real', 'Upright and cannot be projected', 'Inverted and virtual'], correctAnswer: 2, topic: 'Waves and Optics' },
    { question: 'Focal length of mirror is related to radius by:', options: ['R = f', 'R = 2f', 'R = f/2', 'R = 3f'], correctAnswer: 1, topic: 'Waves and Optics' },
    { question: 'Critical angle for total internal reflection occurs when:', options: ['i < r', 'i = r', 'sin(i) = 1/n', 'sin(r) = 1/n'], correctAnswer: 2, topic: 'Waves and Optics' },
    { question: 'Which color has longest wavelength?', options: ['Violet', 'Blue', 'Red', 'Green'], correctAnswer: 2, topic: 'Waves and Optics' },
    // Electricity and Magnetism
    { question: 'What is the SI unit of resistance?', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], correctAnswer: 2, topic: 'Electricity' },
    { question: 'Ohms law states:', options: ['V = IR', 'V = I/R', 'V = I+R', 'V = I-R'], correctAnswer: 0, topic: 'Electricity' },
    { question: 'Power dissipated is given by:', options: ['P = VI', 'P = V/I', 'P = I/V', 'P = V+I'], correctAnswer: 0, topic: 'Electricity' },
    { question: 'Magnetic field is perpendicular to:', options: ['Current', 'Velocity', 'Both', 'Force'], correctAnswer: 2, topic: 'Magnetism' },
    { question: 'What is electromagnetic induction?', options: ['Motion of magnet', 'Induced EMF by changing magnetic field', 'Magnetic field change', 'Electric current'], correctAnswer: 1, topic: 'Magnetism' },
    // Thermodynamics
    { question: 'First law of thermodynamics states:', options: ['Q = W', 'ΔU = Q - W', 'ΔU = Q + W', 'Q = ΔU'], correctAnswer: 1, topic: 'Thermodynamics' },
    { question: 'What is entropy?', options: ['Heat', 'Disorder', 'Order', 'Energy'], correctAnswer: 1, topic: 'Thermodynamics' },
    { question: 'Efficiency of Carnot engine is:', options: ['100%', '50%', '1 - Tc/Th', 'Tc/Th'], correctAnswer: 2, topic: 'Thermodynamics' },
    { question: 'What is absolute zero in Celsius?', options: ['-273.15°C', '0°C', '-100°C', '273.15°C'], correctAnswer: 0, topic: 'Thermodynamics' },
    { question: 'Specific heat capacity is measured in:', options: ['J/kg', 'J/kg·K', 'J·kg', 'K/J'], correctAnswer: 1, topic: 'Thermodynamics' },
    // Modern Physics
    { question: 'What is photon energy?', options: ['E = hf', 'E = h/f', 'E = fν', 'E = λ/h'], correctAnswer: 0, topic: 'Modern Physics' },
    { question: 'Plancks constant is approximately:', options: ['6.6×10³⁴', '6.6×10⁻³⁴', '6.6×10⁻²⁷', '6.6×10²⁷'], correctAnswer: 1, topic: 'Modern Physics' },
    { question: 'What is the mass defect?', options: ['Gain in mass', 'Loss in mass', 'No change', 'Constant mass'], correctAnswer: 1, topic: 'Modern Physics' },
    { question: 'E = mc² relates to:', options: ['Kinetic energy', 'Mass-energy equivalence', 'Potential energy', 'Heat energy'], correctAnswer: 1, topic: 'Modern Physics' },
    { question: 'Bohr model electron shells are:', options: ['Continuous', 'Discrete energy levels', 'Random', 'Elliptical'], correctAnswer: 1, topic: 'Modern Physics' },
  ]
};

// Generate large question pool
const generateQuestionPool = (baseQuestions: any) => {
  const expanded: Question[] = [];
  let id = 1;
  
  for (const subjects of Object.values(baseQuestions)) {
    for (const questions of Object.values(subjects as any)) {
      // Add original questions
      (questions as any[]).forEach((q: any) => {
        expanded.push({ id: id++, ...q });
      });
    }
  }
  return expanded;
};

const mockTestsDatabase: QuizData = {
  class6: generateQuestionPool({ class6: class6Questions }).reduce((acc: any, q: Question) => {
    if (!acc.Mathematics) acc.Mathematics = [];
    if (!acc.Science) acc.Science = [];
    if (!acc.English) acc.English = [];
    
    if (q.topic.includes('Arithmetic') || q.topic.includes('Fraction') || q.topic.includes('Geometry') || q.topic.includes('Place') || q.topic.includes('Multiples') || q.topic.includes('Word')) {
      acc.Mathematics.push(q);
    } else if (class6Questions.Science.some((qs: any) => qs.question === q.question)) {
      acc.Science.push(q);
    } else {
      acc.English.push(q);
    }
    return acc;
  }, {}),
  
  class9: generateQuestionPool({ class9: class9Questions }).reduce((acc: any, q: Question) => {
    if (!acc.Mathematics) acc.Mathematics = [];
    if (!acc.Science) acc.Science = [];
    
    if (q.topic.includes('Equation') || q.topic.includes('Polynomial') || q.topic.includes('Geometry') || q.topic.includes('Area') || q.topic.includes('Statistics')) {
      acc.Mathematics.push(q);
    } else {
      acc.Science.push(q);
    }
    return acc;
  }, {}),
  
  class12: generateQuestionPool({ class12: class12Questions }).reduce((acc: any, q: Question) => {
    if (!acc.Mathematics) acc.Mathematics = [];
    if (!acc.Physics) acc.Physics = [];
    
    if (q.topic.includes('Calculus') || q.topic.includes('Logarithm') || q.topic.includes('Trigonometry') || q.topic.includes('Sequence') || q.topic.includes('Matrix') || q.topic.includes('Complex')) {
      acc.Mathematics.push(q);
    } else {
      acc.Physics.push(q);
    }
    return acc;
  }, {}),
  
  neetFoundation: {
    'Biology': [
      { id: 101, question: 'What is the basic unit of life?', options: ['Tissue', 'Organ', 'Cell', 'Organism'], correctAnswer: 2, topic: 'Cell Biology' },
      { id: 102, question: 'How many chromosomes do humans have?', options: ['23', '46', '92', '48'], correctAnswer: 1, topic: 'Genetics' },
      { id: 103, question: 'Which organelle is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'], correctAnswer: 1, topic: 'Cell Biology' },
      { id: 104, question: 'What is photosynthesis?', options: ['Food breakdown', 'Food synthesis using sunlight', 'Respiration', 'Digestion'], correctAnswer: 1, topic: 'Plant Physiology' },
      { id: 105, question: 'Which is the universal donor blood type?', options: ['O+', 'AB+', 'O-', 'A-'], correctAnswer: 2, topic: 'Human Physiology' },
      { id: 106, question: 'How many chambers does the human heart have?', options: ['2', '3', '4', '5'], correctAnswer: 2, topic: 'Human Physiology' },
      { id: 107, question: 'What is the function of red blood cells?', options: ['Fight infection', 'Transport oxygen', 'Blood clotting', 'Immunity'], correctAnswer: 1, topic: 'Human Physiology' },
      { id: 108, question: 'Which hormone regulates blood sugar?', options: ['Insulin', 'Glucagon', 'Thyroid', 'Adrenaline'], correctAnswer: 0, topic: 'Endocrinology' },
      { id: 109, question: 'How many types of RNA are there?', options: ['2', '3', '4', '5'], correctAnswer: 1, topic: 'Genetics' },
      { id: 110, question: 'What is mutation?', options: ['DNA change', 'Protein change', 'Cell change', 'Organism change'], correctAnswer: 0, topic: 'Genetics' },
      { id: 111, question: 'What is the structure of DNA?', options: ['Single helix', 'Double helix', 'Triple helix', 'Linear'], correctAnswer: 1, topic: 'Genetics' },
      { id: 112, question: 'Which organelle synthesizes proteins?', options: ['Lysosome', 'Ribosome', 'Mitochondria', 'Nucleus'], correctAnswer: 1, topic: 'Cell Biology' },
      { id: 113, question: 'What is the function of the ribosome?', options: ['Energy production', 'Protein synthesis', 'Lipid metabolism', 'Storage'], correctAnswer: 1, topic: 'Cell Biology' },
      { id: 114, question: 'Which blood cells fight pathogens?', options: ['RBC', 'WBC', 'Platelets', 'Plasma'], correctAnswer: 1, topic: 'Human Physiology' },
      { id: 115, question: 'What is meiosis?', options: ['Cell growth', 'DNA replication', 'Cell division producing gametes', 'Protein synthesis'], correctAnswer: 2, topic: 'Cell Division' },
      { id: 116, question: 'How many gametes are produced by meiosis?', options: ['1', '2', '3', '4'], correctAnswer: 3, topic: 'Cell Division' },
      { id: 117, question: 'What is transpiration?', options: ['Water release from soil', 'Water release from plants', 'Water absorption', 'Photosynthesis'], correctAnswer: 1, topic: 'Plant Physiology' },
      { id: 118, question: 'Which is the site of photosynthesis?', options: ['Mitochondria', 'Ribosome', 'Chloroplast', 'Nucleus'], correctAnswer: 2, topic: 'Plant Physiology' },
      { id: 119, question: 'What is the primary pigment in photosynthesis?', options: ['Xanthophyll', 'Chlorophyll', 'Carotenoid', 'Anthocyanin'], correctAnswer: 1, topic: 'Plant Physiology' },
      { id: 120, question: 'How many types of white blood cells are there?', options: ['3', '4', '5', '6'], correctAnswer: 2, topic: 'Human Physiology' },
      { id: 121, question: 'What is the function of the pancreas?', options: ['Digestion only', 'Hormone production only', 'Both A and B', 'Immunity'], correctAnswer: 2, topic: 'Endocrinology' },
      { id: 122, question: 'Which vitamin helps in bone formation?', options: ['Vitamin A', 'Vitamin D', 'Vitamin C', 'Vitamin B'], correctAnswer: 1, topic: 'Nutrition' },
      { id: 123, question: 'What is the function of lysosomes?', options: ['Energy production', 'Digestion within cells', 'Protein synthesis', 'Storage'], correctAnswer: 1, topic: 'Cell Biology' },
      { id: 124, question: 'How many layers does the cell membrane have?', options: ['1', '2', '3', '4'], correctAnswer: 1, topic: 'Cell Biology' },
      { id: 125, question: 'What is the function of cilia?', options: ['Storage', 'Movement', 'Protection', 'Digestion'], correctAnswer: 1, topic: 'Cell Biology' },
    ],
    'Chemistry': [
      { id: 126, question: 'What is the pH of pure water?', options: ['5', '6', '7', '8'], correctAnswer: 2, topic: 'Acids and Bases' },
      { id: 127, question: 'What is an isotope?', options: ['Same Z, diff A', 'Different Z', 'Same mass number', 'Same neutrons'], correctAnswer: 0, topic: 'Atomic Structure' },
      { id: 128, question: 'What is Avogadro\'s number?', options: ['6.02×10²³', '6.02×10²⁴', '6.02×10²²', '6.02×10²⁵'], correctAnswer: 0, topic: 'Mole Concept' },
      { id: 129, question: 'Which is a strong acid?', options: ['CH₃COOH', 'HCl', 'H₂CO₃', 'NH₃'], correctAnswer: 1, topic: 'Acids and Bases' },
      { id: 130, question: 'What is a buffer solution?', options: ['Pure water', 'Salt solution', 'Solution resisting pH change', 'Acidic solution'], correctAnswer: 2, topic: 'Solutions' },
      { id: 131, question: 'What is the oxidation state of hydrogen in H₂O?', options: ['+1', '-1', '+2', '-2'], correctAnswer: 0, topic: 'Oxidation States' },
      { id: 132, question: 'What is electronegativity?', options: ['Lose electrons', 'Attract electrons', 'Form bonds', 'Conduct electricity'], correctAnswer: 1, topic: 'Chemical Bonding' },
      { id: 133, question: 'Which bond is strongest?', options: ['Ionic', 'Covalent', 'Hydrogen', 'Van der Waals'], correctAnswer: 1, topic: 'Chemical Bonding' },
      { id: 134, question: 'What is molarity?', options: ['Moles/liter', 'Moles/kg', 'Grams/liter', 'Moles/mL'], correctAnswer: 0, topic: 'Solutions' },
      { id: 135, question: 'What is the molecular weight of CO₂?', options: ['44', '46', '48', '50'], correctAnswer: 0, topic: 'Mole Concept' },
      { id: 136, question: 'What is the valency of oxygen?', options: ['+2', '-1', '-2', '+1'], correctAnswer: 2, topic: 'Chemical Bonding' },
      { id: 137, question: 'Which is a noble gas?', options: ['O₂', 'He', 'H₂', 'N₂'], correctAnswer: 1, topic: 'Periodic Table' },
      { id: 138, question: 'What is the formula for calcium carbonate?', options: ['Ca₂CO₃', 'CaCO₂', 'CaCO₃', 'Ca₃CO'], correctAnswer: 2, topic: 'Chemical Formulas' },
      { id: 139, question: 'Which metal is most reactive?', options: ['Silver', 'Sodium', 'Gold', 'Copper'], correctAnswer: 1, topic: 'Periodic Properties' },
      { id: 140, question: 'What is the oxidation state of Cl in NaCl?', options: ['+1', '-1', '0', '+2'], correctAnswer: 1, topic: 'Oxidation States' },
      { id: 141, question: 'What is a cation?', options: ['Negative ion', 'Positive ion', 'Neutral particle', 'Atom'], correctAnswer: 1, topic: 'Ions' },
      { id: 142, question: 'What is the boiling point of water?', options: ['90°C', '100°C', '110°C', '120°C'], correctAnswer: 1, topic: 'States of Matter' },
      { id: 143, question: 'Which element has atomic number 6?', options: ['Oxygen', 'Carbon', 'Nitrogen', 'Fluorine'], correctAnswer: 1, topic: 'Periodic Table' },
      { id: 144, question: 'What is the formula for sodium chloride?', options: ['Na₂Cl', 'NaCl₂', 'NaCl', 'Na₃Cl'], correctAnswer: 2, topic: 'Chemical Formulas' },
      { id: 145, question: 'What is reduction?', options: ['Loss of electrons', 'Gain of electrons', 'Loss of oxygen', 'Gain of hydrogen'], correctAnswer: 1, topic: 'Oxidation Reduction' },
      { id: 146, question: 'What is the pH of a base?', options: ['<7', '=7', '>7', '=0'], correctAnswer: 2, topic: 'Acids and Bases' },
      { id: 147, question: 'Which is an anion?', options: ['Na⁺', 'K⁺', 'Cl⁻', 'Mg²⁺'], correctAnswer: 2, topic: 'Ions' },
      { id: 148, question: 'What is crystallization?', options: ['Melting', 'Freezing', 'Formation of crystals', 'Evaporation'], correctAnswer: 2, topic: 'States of Matter' },
      { id: 149, question: 'Which is a diatomic molecule?', options: ['O₃', 'O₂', 'P₄', 'S₈'], correctAnswer: 1, topic: 'Molecular Structure' },
      { id: 150, question: 'What is sublimation?', options: ['Liquid to solid', 'Solid to gas', 'Gas to liquid', 'Solid to liquid'], correctAnswer: 1, topic: 'States of Matter' },
    ],
    'Physics': [
      { id: 151, question: 'What is the SI unit of pressure?', options: ['Bar', 'Pascal', 'Torr', 'Atm'], correctAnswer: 1, topic: 'Thermodynamics' },
      { id: 152, question: 'What is Newton\'s first law of motion?', options: ['F=ma', 'Action=Reaction', 'Inertia principle', 'Momentum'], correctAnswer: 2, topic: 'Mechanics' },
      { id: 153, question: 'What is angular momentum?', options: ['L=mvr', 'L=mr', 'L=Iω', 'L=mv/r'], correctAnswer: 2, topic: 'Mechanics' },
      { id: 154, question: 'What is the SI unit of work?', options: ['Watt', 'Volt', 'Joule', 'Newton'], correctAnswer: 2, topic: 'Energy' },
      { id: 155, question: 'What is kinetic energy?', options: ['mgh', 'mv²/2', 'mgh+mv²/2', 'mv'], correctAnswer: 1, topic: 'Energy' },
      { id: 156, question: 'What is Young\'s modulus?', options: ['Force/Area', 'Stress/Strain', 'Strain/Stress', 'Pressure'], correctAnswer: 1, topic: 'Elasticity' },
      { id: 157, question: 'What is Simple Harmonic Motion?', options: ['Uniform circular', 'Constant acceleration', 'Oscillatory with restoring force', 'Projectile motion'], correctAnswer: 2, topic: 'Oscillations' },
      { id: 158, question: 'What is the period of a simple pendulum?', options: ['2π√(l/g)', '2π√(g/l)', 'π√(l/g)', '√(l/g)'], correctAnswer: 0, topic: 'Oscillations' },
      { id: 159, question: 'What is the Doppler effect?', options: ['Frequency change', 'Wavelength change', 'Speed change', 'Both A and B'], correctAnswer: 3, topic: 'Waves' },
      { id: 160, question: 'What is the SI unit of electric field?', options: ['N/C', 'V/m', 'Both', 'None'], correctAnswer: 2, topic: 'Electrostatics' },
      { id: 161, question: 'What is velocity?', options: ['Speed', 'Distance/time', 'Displacement/time', 'Acceleration'], correctAnswer: 2, topic: 'Mechanics' },
      { id: 162, question: 'What mass has a weight of 10N?', options: ['0.1kg', '0.98kg', '1kg', '10kg'], correctAnswer: 2, topic: 'Force' },
      { id: 163, question: 'What is the SI unit of force?', options: ['Dyne', 'Newton', 'Pond', 'Erg'], correctAnswer: 1, topic: 'Force' },
      { id: 164, question: 'Newton\'s second law:', options: ['F=ma', 'a=F/m', 'Both', 'Neither'], correctAnswer: 2, topic: 'Force' },
      { id: 165, question: 'What is potential energy?', options: ['Energy of motion', 'Energy of position', 'Total energy', 'Heat energy'], correctAnswer: 1, topic: 'Energy' },
      { id: 166, question: 'What is the speed of light?', options: ['3×10⁸ m/s', '3×10⁷ m/s', '3×10⁹ m/s', '3×10⁶ m/s'], correctAnswer: 0, topic: 'Waves' },
      { id: 167, question: 'What is friction?', options: ['Attraction', 'Repulsion', 'Resistance to motion', 'Force carrier'], correctAnswer: 2, topic: 'Friction' },
      { id: 168, question: 'What is the SI unit of pressure?', options: ['Pascal', 'Bar', 'Atm', 'Torr'], correctAnswer: 0, topic: 'Pressure' },
      { id: 169, question: 'What is density?', options: ['Mass', 'Volume', 'Mass/Volume', 'Volume/Mass'], correctAnswer: 2, topic: 'Properties' },
      { id: 170, question: 'What is acceleration due to gravity?', options: ['9.8 m/s', '9.8 m/s²', '8.9 m/s²', '10 m/s'], correctAnswer: 1, topic: 'Motion' },
      { id: 171, question: 'What is reflection of light?', options: ['Bending', 'Bouncing back', 'Absorption', 'Scattering'], correctAnswer: 1, topic: 'Optics' },
      { id: 172, question: 'What is refraction of light?', options: ['Bouncing back', 'Bending at interface', 'Absorption', 'Scattering'], correctAnswer: 1, topic: 'Optics' },
      { id: 173, question: 'What is the law of reflection?', options: ['i=r', 'i>r', 'i<r', 'i+r=90'], correctAnswer: 0, topic: 'Optics' },
      { id: 174, question: 'What is a convex lens?', options: ['Converging', 'Diverging', 'Flat', 'Curved'], correctAnswer: 0, topic: 'Optics' },
      { id: 175, question: 'What is the SI unit of temperature?', options: ['Celsius', 'Fahrenheit', 'Kelvin', 'Rankine'], correctAnswer: 2, topic: 'Thermodynamics' },
    ]
  },
  jee: {
    'Mathematics': [
      { id: 176, question: 'If a+b+c=9 and ab+bc+ca=26, find a²+b²+c²', options: ['26', '29', 'Need info', '15'], correctAnswer: 1, topic: 'Algebra' },
      { id: 177, question: 'Sum of 1+2+3+...+n:', options: ['n²', 'n(n+1)/2', 'n(n-1)/2', 'n³'], correctAnswer: 1, topic: 'Series' },
      { id: 178, question: 'What is sinh(x)?', options: ['(eˣ-e⁻ˣ)/2', '(eˣ+e⁻ˣ)/2', 'eˣ-e⁻ˣ', 'eˣ+e⁻ˣ'], correctAnswer: 0, topic: 'Hyperbolic Functions' },
      { id: 179, question: 'Lim(x→0) sin(x)/x = ?', options: ['0', '1', 'undefined', 'infinity'], correctAnswer: 1, topic: 'Limits' },
      { id: 180, question: 'Range of cos(x):', options: ['[-1,1]', '[0,1]', '[0,∞)', 'All real'], correctAnswer: 0, topic: 'Trigonometry' },
      { id: 181, question: 'If sin(x)=1/2, principal value:', options: ['π/6', 'π/4', 'π/3', 'π/2'], correctAnswer: 0, topic: 'Trigonometry' },
      { id: 182, question: 'What is tan(2x)?', options: ['2tan(x)/(1-tan²(x))', '2tan(x)/(1+tan²(x))', 'tan(x)/(1-tan²(x))', '2tan(x)(1+tan²(x))'], correctAnswer: 0, topic: 'Trigonometry' },
      { id: 183, question: 'Rank of [[1,2],[2,4]]:', options: ['0', '1', '2', '3'], correctAnswer: 1, topic: 'Linear Algebra' },
      { id: 184, question: 'If det(A)=0, then A is:', options: ['Singular', 'Non-singular', 'Invertible', 'Orthogonal'], correctAnswer: 0, topic: 'Linear Algebra' },
      { id: 185, question: 'Eccentricity of ellipse:', options: ['e>1', 'e=1', '0<e<1', 'e=0'], correctAnswer: 2, topic: 'Conic Sections' },
      { id: 186, question: 'Derivative of sin(x):', options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'], correctAnswer: 0, topic: 'Calculus' },
      { id: 187, question: 'Integral of cos(x):', options: ['sin(x)+C', '-sin(x)+C', 'cos(x)+C', 'tan(x)+C'], correctAnswer: 0, topic: 'Calculus' },
      { id: 188, question: 'What is the discriminant formula?', options: ['b²-ac', 'b²-4ac', 'b-4ac', 'a²-bc'], correctAnswer: 1, topic: 'Algebra' },
      { id: 189, question: 'How many roots if discriminant > 0?', options: ['0', '1', '2', 'Complex'], correctAnswer: 2, topic: 'Algebra' },
      { id: 190, question: 'tan⁻¹(1) = ?', options: ['0', 'π/6', 'π/4', 'π/2'], correctAnswer: 2, topic: 'Trigonometry' },
      { id: 191, question: 'What is the formula for permutations?', options: ['n!', 'n!/r!', 'n!/(r!(n-r)!)', 'n×(n-1)'], correctAnswer: 1, topic: 'Combinatorics' },
      { id: 192, question: 'What is the formula for combinations?', options: ['n!/r!', 'n!/(n-r)!', 'n!/(r!(n-r)!)', 'n!/(r!)'], correctAnswer: 2, topic: 'Combinatorics' },
      { id: 193, question: 'If A=[1,2], B=[2,3], A∩B=?', options: ['{1,2}', '{2}', '{2,3}', '{1,2,3}'], correctAnswer: 1, topic: 'Set Theory' },
      { id: 194, question: 'A∪B for A=[1,2], B=[2,3]:', options: ['{2}', '{1}', '{1,2,3}', '{3}'], correctAnswer: 2, topic: 'Set Theory' },
      { id: 195, question: 'What is log(ab)?', options: ['log(a)+log(b)', 'log(a)-log(b)', 'log(a)×log(b)', 'log(a)/log(b)'], correctAnswer: 0, topic: 'Logarithms' },
      { id: 196, question: 'What is log(aⁿ)?', options: ['n×log(a)', 'log(a)/n', 'n+log(a)', 'n-log(a)'], correctAnswer: 0, topic: 'Logarithms' },
      { id: 197, question: 'If 2ˣ=8, find x:', options: ['1', '2', '3', '4'], correctAnswer: 2, topic: 'Exponentials' },
      { id: 198, question: 'Slope of y=x²:', options: ['x', '2x', 'x²', '2'], correctAnswer: 1, topic: 'Calculus' },
      { id: 199, question: 'What is e approximately?', options: ['2.17', '2.71', '3.14', '1.41'], correctAnswer: 1, topic: 'Constants' },
      { id: 200, question: 'What is π approximately?', options: ['2.14', '2.71', '3.14', '1.41'], correctAnswer: 2, topic: 'Constants' },
    ],
    'Physics': [
      { id: 201, question: 'Projectile at 45°, range formula:', options: ['v²/g', 'v²sin(90°)/g', 'v²sin(90°)/g', 'v²sin(45°)/g'], correctAnswer: 2, topic: 'Projectile Motion' },
      { id: 202, question: 'Centripetal acceleration:', options: ['v²/r', 'ω²r', 'v×ω', 'Both A and B'], correctAnswer: 3, topic: 'Circular Motion' },
      { id: 203, question: 'Moment of inertia of disk:', options: ['MR²', 'MR²/2', 'MR²/4', 'MR²/3'], correctAnswer: 1, topic: 'Rotational Motion' },
      { id: 204, question: 'Gravitational potential energy:', options: ['mgh', '-GMm/r', 'mg', 'Constant'], correctAnswer: 1, topic: 'Gravitation' },
      { id: 205, question: 'Escape velocity:', options: ['√(GM/R)', '√(2GM/R)', '√(GM/2R)', '√(3GM/R)'], correctAnswer: 1, topic: 'Gravitation' },
      { id: 206, question: 'Kepler\'s third law:', options: ['T²∝r', 'T²∝r²', 'T²∝r³', 'T∝r'], correctAnswer: 2, topic: 'Gravitation' },
      { id: 207, question: 'Speed of light:', options: ['3×10⁸', '3×10⁹', '3×10⁷', '3×10¹⁰'], correctAnswer: 0, topic: 'Optics' },
      { id: 208, question: 'Critical angle for TIR:', options: ['sin(θc)=n', 'sin(θc)=1/n', 'sin(θc)=n²', 'sin(θc)=√n'], correctAnswer: 1, topic: 'Optics' },
      { id: 209, question: 'Ohm\'s law:', options: ['V=IR', 'V=I/R', 'V=I+R', 'V=I-R'], correctAnswer: 0, topic: 'Electricity' },
      { id: 210, question: 'Power dissipated:', options: ['P=VI', 'P=V/I', 'P=I/V', 'P=V+I'], correctAnswer: 0, topic: 'Electricity' },
      { id: 211, question: 'Coulomb\'s law constant k:', options: ['8.99×10⁸', '9.99×10⁹', '8.99×10⁹', '9.99×10⁸'], correctAnswer: 2, topic: 'Electrostatics' },
      { id: 212, question: 'Electric field formula:', options: ['F/q', 'q/F', 'F×q', 'q+F'], correctAnswer: 0, topic: 'Electrostatics' },
      { id: 213, question: 'Magnetic force on charge:', options: ['F=qvB', 'F=q/vB', 'F=B/qv', 'F=qB/v'], correctAnswer: 0, topic: 'Magnetism' },
      { id: 214, question: 'Faraday\'s law:', options: ['ε=Bl×v', 'ε=-dΦ/dt', 'ε=Blv', 'Both A and B'], correctAnswer: 3, topic: 'Electromagnetic Induction' },
      { id: 215, question: 'First law of thermodynamics:', options: ['ΔU=Q-W', 'ΔU=Q+W', 'Q=W+ΔU', 'W=Q-ΔU'], correctAnswer: 0, topic: 'Thermodynamics' },
      { id: 216, question: 'Entropy related to disorder:', options: ['True', 'False', 'Sometimes', 'Never'], correctAnswer: 0, topic: 'Thermodynamics' },
      { id: 217, question: 'Speed of sound:', options: ['300 m/s', '330 m/s', '300 km/h', 'Variable'], correctAnswer: 1, topic: 'Waves' },
      { id: 218, question: 'Frequency and wavelength:', options: ['f=v/λ', 'f=λ/v', 'f=v×λ', 'f=v+λ'], correctAnswer: 0, topic: 'Waves' },
      { id: 219, question: 'De Broglie wavelength:', options: ['λ=h/p', 'λ=p/h', 'λ=h×p', 'λ=h+p'], correctAnswer: 0, topic: 'Modern Physics' },
      { id: 220, question: 'Planck\'s constant h:', options: ['6.63×10³⁴', '6.63×10⁻³⁴', '6.63×10³³', '6.63×10⁻³³'], correctAnswer: 1, topic: 'Modern Physics' },
      { id: 221, question: 'Einstein mass-energy:', options: ['E=mc', 'E=mc²', 'E=m/c', 'E=c²/m'], correctAnswer: 1, topic: 'Modern Physics' },
      { id: 222, question: 'Photon energy:', options: ['E=hf', 'E=f/h', 'E=h/f', 'E=h+f'], correctAnswer: 0, topic: 'Modern Physics' },
      { id: 223, question: 'Time dilation:', options: ['t=t₀/(1-v²/c²)', 't=t₀√(1-v²/c²)', 't=t₀/(1+v²/c²)', 'No change'], correctAnswer: 1, topic: 'Special Relativity' },
      { id: 224, question: 'Bohr model principal quantum:', options: ['n=0,1,2...', 'n=1,2,3...', 'n=-1,0,1', 'n=0 only'], correctAnswer: 1, topic: 'Atomic Physics' },
      { id: 225, question: 'Half-life relationship:', options: ['N=N₀(1/2)ⁿ', 'N=N₀×2ⁿ', 'N=N₀+n', 'N=N₀-n'], correctAnswer: 0, topic: 'Nuclear Physics' },
    ],
    'Chemistry': [
      { id: 226, question: 'Highest 1st ionization energy:', options: ['Na', 'Mg', 'Al', 'Si'], correctAnswer: 1, topic: 'Periodic Properties' },
      { id: 227, question: 'Bond dissociation energy:', options: ['Break bond', 'Form bond', 'Total energy', 'Activation energy'], correctAnswer: 0, topic: 'Chemical Bonding' },
      { id: 228, question: 'VSEPR predicts:', options: ['Electrons', 'Bonds', 'Lone pairs', 'Both B and C'], correctAnswer: 3, topic: 'Molecular Structure' },
      { id: 229, question: 'Hybridization in CH₄:', options: ['sp', 'sp²', 'sp³', 'sp³d'], correctAnswer: 2, topic: 'Bonding' },
      { id: 230, question: 'Reaction quotient Q:', options: ['Rate', 'Concentration ratio', 'K value', 'Equilibrium constant'], correctAnswer: 1, topic: 'Equilibrium' },
      { id: 231, question: 'Le Chatelier\'s principle:', options: ['Mass conservation', 'System responds to stress', 'Entropy increases', 'Change is spontaneous'], correctAnswer: 1, topic: 'Equilibrium' },
      { id: 232, question: 'Gibbs free energy:', options: ['ΔH-TΔS', 'ΔH+TΔS', 'TΔS-ΔH', 'ΔH/ΔS'], correctAnswer: 0, topic: 'Thermodynamics' },
      { id: 233, question: 'Rate law nth order:', options: ['t₁/₂∝[A]ⁿ', 't₁/₂∝[A]ⁿ⁻¹', 't₁/₂∝1/[A]ⁿ', 't₁/₂∝[A]'], correctAnswer: 1, topic: 'Kinetics' },
      { id: 234, question: 'Catalyst effect:', options: ['Increase Ea', 'Change equilibrium', 'Increase rate', 'Both B and C'], correctAnswer: 2, topic: 'Kinetics' },
      { id: 235, question: 'Nernst equation:', options: ['E=E°-(RT/nF)ln(Q)', 'E=E°+(RT/nF)ln(Q)', 'E=E°×ln(Q)', 'E=E°/ln(Q)'], correctAnswer: 0, topic: 'Electrochemistry' },
      { id: 236, question: 'Electrode potential:', options: ['E>0 spontaneous', 'E<0 spontaneous', 'E=0 always', 'Either'], correctAnswer: 0, topic: 'Electrochemistry' },
      { id: 237, question: 'Oxidation at:', options: ['Anode', 'Cathode', 'Salt bridge', 'Vessel wall'], correctAnswer: 0, topic: 'Electrochemistry' },
      { id: 238, question: 'Reduction at:', options: ['Anode', 'Cathode', 'Container', 'Solution'], correctAnswer: 1, topic: 'Electrochemistry' },
      { id: 239, question: 'SN1 mechanism has:', options: ['One step', 'Two steps', 'Three steps', 'Four steps'], correctAnswer: 1, topic: 'Organic Chemistry' },
      { id: 240, question: 'SN2 mechanism type:', options: ['Bimolecular', 'Unimolecular', 'Termolecular', 'Monomolecular'], correctAnswer: 0, topic: 'Organic Chemistry' },
      { id: 241, question: 'Markovnikov\'s rule:', options: ['H to C with more H', 'H to C with less H', 'H to O always', 'H to N always'], correctAnswer: 0, topic: 'Organic Chemistry' },
      { id: 242, question: 'Aromatic rings have:', options: ['sp carbons', 'sp² carbons', 'sp³ carbons', 'Mixed'], correctAnswer: 1, topic: 'Organic Chemistry' },
      { id: 243, question: 'Benzene resonance:', options: ['No resonance', 'One structure', 'Two structures', 'Many structures'], correctAnswer: 2, topic: 'Organic Chemistry' },
      { id: 244, question: 'Aldehyde functional group:', options: ['C=O at end', 'C=O in middle', 'C-O-C', 'C≡N'], correctAnswer: 0, topic: 'Organic Chemistry' },
      { id: 245, question: 'Carboxylic acid group:', options: ['-CHO', '-COOH', '-C=O', '-OH'], correctAnswer: 1, topic: 'Organic Chemistry' },
      { id: 246, question: 'Ester formation:', options: ['Acid + Base', 'Acid + Alkene', 'Acid + Alcohol', 'Alcohol + Ether'], correctAnswer: 2, topic: 'Organic Chemistry' },
      { id: 247, question: 'Primary alcohol examples:', options: ['CH₃OH', 'C₂H₅OH', 'Both', 'Neither'], correctAnswer: 2, topic: 'Organic Chemistry' },
      { id: 248, question: 'Reducing sugars contain:', options: ['Aldehyde group', 'Ketone group', 'Both', 'Hemiacetal'], correctAnswer: 0, topic: 'Biochemistry' },
      { id: 249, question: 'Peptide bond between:', options: ['Amino acids', 'Sugars', 'Nucleotides', 'Lipids'], correctAnswer: 0, topic: 'Biochemistry' },
      { id: 250, question: 'DNA base pairs:', options: ['A-U, G-C', 'A-T, G-C', 'A-G, T-C', 'Any pair'], correctAnswer: 1, topic: 'Biochemistry' },
    ]
  },
  jkssb: {
    'General Knowledge': [
      { id: 251, question: 'Capital of India:', options: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata'], correctAnswer: 1, topic: 'Indian Geography' },
      { id: 252, question: 'How many states in India:', options: ['28', '29', '30', '31'], correctAnswer: 0, topic: 'Indian States' },
      { id: 253, question: 'Longest river in India:', options: ['Brahmaputra', 'Ganges', 'Indus', 'Godavari'], correctAnswer: 1, topic: 'Geography' },
      { id: 254, question: 'Union territories in India:', options: ['7', '8', '9', '10'], correctAnswer: 2, topic: 'Geography' },
      { id: 255, question: 'Highest mountain in India:', options: ['Kanchenjunga', 'Nanda Devi', 'Kangto', 'Makalu'], correctAnswer: 0, topic: 'Geography' },
      { id: 256, question: 'National animal:', options: ['Lion', 'Tiger', 'Elephant', 'Peacock'], correctAnswer: 1, topic: 'National Symbols' },
      { id: 257, question: 'National bird:', options: ['Pigeon', 'Peacock', 'Crane', 'Eagle'], correctAnswer: 1, topic: 'National Symbols' },
      { id: 258, question: 'Eastern border country:', options: ['Pakistan', 'Myanmar', 'China', 'Nepal'], correctAnswer: 1, topic: 'Geography' },
      { id: 259, question: 'Currency of India:', options: ['Dollar', 'Rupee', 'Pound', 'Euro'], correctAnswer: 1, topic: 'Economy' },
      { id: 260, question: 'Constitution framer:', options: ['Nehru', 'Ambedkar', 'Patel', 'Gandhi'], correctAnswer: 1, topic: 'History' },
      { id: 261, question: 'First Prime Minister of India:', options: ['Sardar Patel', 'Jawaharlal Nehru', 'Dr. Rajendra Prasad', 'Lal Bahadur Shastri'], correctAnswer: 1, topic: 'History' },
      { id: 262, question: 'First President of India:', options: ['C. Rajagopalachari', 'Dr. Rajendra Prasad', 'Abul Kalam Azad', 'K.R. Narayanan'], correctAnswer: 1, topic: 'History' },
      { id: 263, question: 'Independence day of India:', options: ['15 August 1947', '26 January 1950', '15 August 1948', '26 January 1949'], correctAnswer: 0, topic: 'History' },
      { id: 264, question: 'Republic day of India:', options: ['15 August', '26 January', '15 November', '26 November'], correctAnswer: 1, topic: 'History' },
      { id: 265, question: 'Largest state by area:', options: ['Madhya Pradesh', 'Rajasthan', 'Karnataka', 'Maharashtra'], correctAnswer: 1, topic: 'Geography' },
      { id: 266, question: 'Smallest state by area:', options: ['Sikkim', 'Goa', 'Tripura', 'Manipur'], correctAnswer: 1, topic: 'Geography' },
      { id: 267, question: 'Northern plains called:', options: ['Deccan', 'Indo-Gangetic', 'Coastal', 'Eastern'], correctAnswer: 1, topic: 'Geography' },
      { id: 268, question: 'Southernmost point of India:', options: ['Kano Cape', 'Indira Point', 'Rameswaram', 'Cochin'], correctAnswer: 1, topic: 'Geography' },
      { id: 269, question: 'Westernmost point:', options: ['Arabian Sea', 'Kutch', 'Gateway of India', 'Arabian coast'], correctAnswer: 1, topic: 'Geography' },
      { id: 270, question: 'Indian standard time difference GMT:', options: ['+5', '+5.5', '+6', '+4.5'], correctAnswer: 1, topic: 'Geography' },
      { id: 271, question: 'Parliament consists of:', options: ['House only', 'Lok Sabha & Rajya Sabha', 'President only', 'PM only'], correctAnswer: 1, topic: 'Government' },
      { id: 272, question: 'Lok Sabha members:', options: ['220', '245', '550', '750'], correctAnswer: 2, topic: 'Government' },
      { id: 273, question: 'Rajya Sabha members:', options: ['220', '245', '250', '275'], correctAnswer: 1, topic: 'Government' },
      { id: 274, question: 'Term of President:', options: ['4 years', '5 years', '6 years', '7 years'], correctAnswer: 1, topic: 'Government' },
      { id: 275, question: 'Founder of Indian nation:', options: ['M.K. Gandhi', 'Jawaharlal Nehru', 'B.R. Ambedkar', 'Sardar Patel'], correctAnswer: 0, topic: 'History' },
    ],
    'English': [
      { id: 276, question: 'Meaning of benevolent:', options: ['Kind', 'Cruel', 'Angry', 'Happy'], correctAnswer: 0, topic: 'Vocabulary' },
      { id: 277, question: 'Synonym of diligent:', options: ['Lazy', 'Hardworking', 'Careless', 'Ignorant'], correctAnswer: 1, topic: 'Vocabulary' },
      { id: 278, question: 'Antonym of brave:', options: ['Courageous', 'Bold', 'Cowardly', 'Strong'], correctAnswer: 2, topic: 'Vocabulary' },
      { id: 279, question: 'Correct spelling:', options: ['Occassion', 'Ocasion', 'Occasion', 'Occation'], correctAnswer: 2, topic: 'Spelling' },
      { id: 280, question: 'Plural of mouse:', options: ['Mouses', 'Mice', 'Mousse', 'Mouse'], correctAnswer: 1, topic: 'Grammar' },
      { id: 281, question: 'A pronoun is:', options: ['Noun substitute', 'Action word', 'Describing word', 'Connecting word'], correctAnswer: 0, topic: 'Grammar' },
      { id: 282, question: 'He ___ school daily:', options: ['Go', 'Goes', 'Going', 'Went'], correctAnswer: 1, topic: 'Verb Conjugation' },
      { id: 283, question: 'Grammatically correct:', options: ['She are', 'She am', 'She is', 'She be'], correctAnswer: 2, topic: 'Grammar' },
      { id: 284, question: 'Passive: "He wrote a book":', options: ['Book was by him', 'Book was written', 'Book was shown', 'He was written'], correctAnswer: 1, topic: 'Voice' },
      { id: 285, question: 'Idiomatic phrase "Piece of cake":', options: ['Difficult', 'Easy', 'Sweet', 'Edible'], correctAnswer: 1, topic: 'Idioms' },
      { id: 286, question: 'Synonym of ancient:', options: ['Modern', 'Old', 'New', 'Recent'], correctAnswer: 1, topic: 'Vocabulary' },
      { id: 287, question: 'Antonym of beautiful:', options: ['Pretty', 'Ugly', 'Stunning', 'Gorgeous'], correctAnswer: 1, topic: 'Vocabulary' },
      { id: 288, question: 'Meaning of meticulous:', options: ['Careless', 'Careful', 'Bold', 'Rash'], correctAnswer: 1, topic: 'Vocabulary' },
      { id: 289, question: 'Adverb in "He runs quickly":', options: ['He', 'runs', 'quickly', 'He runs'], correctAnswer: 2, topic: 'Parts of Speech' },
      { id: 290, question: 'Adjective describes:', options: ['Action', 'Noun', 'Verb', 'Sentence'], correctAnswer: 1, topic: 'Parts of Speech' },
      { id: 291, question: 'Article in English:', options: ['a, an, the', 'is, am, are', 'this, that', 'and, but'], correctAnswer: 0, topic: 'Grammar' },
      { id: 292, question: 'Simple present use:', options: ['Past habit', 'Current action', 'Future plan', 'General truth'], correctAnswer: 3, topic: 'Tenses' },
      { id: 293, question: 'Present continuous:', options: ['is/are+verb', 'verb+ing', 'is/are + verb+ing', 'was + verb'], correctAnswer: 2, topic: 'Tenses' },
      { id: 294, question: 'Past tense of "go":', options: ['Goes', 'Going', 'Gone', 'Went'], correctAnswer: 3, topic: 'Verb Forms' },
      { id: 295, question: 'Plural of "child":', options: ['Childs', 'Childes', 'Children', 'Childres'], correctAnswer: 2, topic: 'Grammar' },
    ],
    'Reasoning': [
      { id: 296, question: 'Next in series 2,4,8,16:', options: ['24', '32', '30', '28'], correctAnswer: 1, topic: 'Number Series' },
      { id: 297, question: 'Next in series A,C,E,G:', options: ['H', 'I', 'J', 'K'], correctAnswer: 1, topic: 'Letter Series' },
      { id: 298, question: 'If 2+2=4, then 3+3=:', options: ['5', '6', '7', '8'], correctAnswer: 1, topic: 'Analogy' },
      { id: 299, question: 'Odd one: 1,2,3,5,7,9:', options: ['1', '5', '9', '7'], correctAnswer: 1, topic: 'Classification' },
      { id: 300, question: 'If A=1, B=2, then Z=:', options: ['24', '25', '26', '27'], correctAnswer: 2, topic: 'Coding' },
      { id: 301, question: 'Missing: 1,1,2,3,5,8,:', options: ['11', '12', '13', '15'], correctAnswer: 3, topic: 'Fibonacci Series' },
      { id: 302, question: 'Yesterday was Monday, tomorrow:', options: ['Monday', 'Wednesday', 'Thursday', 'Tuesday'], correctAnswer: 1, topic: 'Logic' },
      { id: 303, question: 'Series 1,4,9,16,25,:', options: ['35', '36', '37', '38'], correctAnswer: 1, topic: 'Pattern Recognition' },
      { id: 304, question: 'If A>B, B>C, then:', options: ['A<C', 'A>C', 'A=C', 'Cannot tell'], correctAnswer: 1, topic: 'Logic' },
      { id: 305, question: 'HELLO mirror image:', options: ['OLLEH', 'ELLOH', 'OLLE', 'HELL'], correctAnswer: 0, topic: 'Spatial Reasoning' },
      { id: 306, question: 'Next in 2,6,12,20,:', options: ['28', '30', '32', '34'], correctAnswer: 0, topic: 'Number Series' },
      { id: 307, question: 'Time relation: 3:9 = 4:?', options: ['12', '13', '14', '15'], correctAnswer: 0, topic: 'Analogy' },
      { id: 308, question: 'Odd: Cat, Mouse, Dog, Tiger:', options: ['Cat', 'Mouse', 'Dog', 'Tiger'], correctAnswer: 1, topic: 'Classification' },
      { id: 309, question: 'Code: A=1, B=2...Z=26. X=?', options: ['23', '24', '25', '26'], correctAnswer: 2, topic: 'Coding' },
      { id: 310, question: 'Series: 10,20,40,80:', options: ['100', '120', '160', '180'], correctAnswer: 2, topic: 'Number Series' },
      { id: 311, question: 'Mother of father is:', options: ['Sister', 'Grandmother', 'Aunt', 'Brother'], correctAnswer: 1, topic: 'Relationships' },
      { id: 312, question: 'Priya is taller than Asha. Asha>Bharti. Tall order:', options: ['Priya>Bharti', 'Bharti>Priya', 'Cannot tell', 'Equal'], correctAnswer: 0, topic: 'Logic' },
      { id: 313, question: 'Common: Watch, Clock, ?, Compass', options: ['Map', 'Scale', 'Thermometer', 'Ruler'], correctAnswer: 2, topic: 'Classification' },
      { id: 314, question: 'Complete: Jan, Feb, Mar, ?', options: ['April', 'June', 'May', 'April'], correctAnswer: 3, topic: 'Series' },
      { id: 315, question: 'Direction: East, South, West, ?', options: ['North', 'South', 'East', 'Northeast'], correctAnswer: 0, topic: 'Directions' },
    ]
  }
};

// Expand question pools with variations
const expandQuestions = (baseQuestions: Question[]): Question[] => {
  const expanded: Question[] = [];
  const topics = [...new Set(baseQuestions.map(q => q.topic))];
  let id = 500;
  
  // Add base questions
  baseQuestions.forEach(q => expanded.push(q));
  
  // Generate variations for each topic
  topics.forEach(topic => {
    const topicQuestions = baseQuestions.filter(q => q.topic === topic);
    topicQuestions.forEach((q) => {
      for (let v = 1; v <= 50; v++) {
        expanded.push({
          id: id++,
          question: `[Variant ${v}] ${q.question}`,
          options: q.options,
          correctAnswer: q.correctAnswer,
          topic: q.topic
        });
      }
    });
  });
  
  return expanded;
};

const classMappings = {
  class6: 'Class 6th',
  class9: 'Class 9th',
  class12: 'Class 12th'
};

export default function MockTestsQA({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<'filter' | 'quiz' | 'results'>('filter');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [questions, setQuestions] = useState<Question[]>([]);

  const getSubjects = () => {
    if (selectedCategory.startsWith('class')) {
      return Object.keys(mockTestsDatabase[selectedCategory as keyof typeof mockTestsDatabase] || {});
    } else if (selectedCategory === 'neetFoundation') {
      return Object.keys(mockTestsDatabase.neetFoundation || {});
    } else if (selectedCategory === 'jee') {
      return Object.keys(mockTestsDatabase.jee || {});
    } else if (selectedCategory === 'jkssb') {
      return Object.keys(mockTestsDatabase.jkssb || {});
    }
    return [];
  };

  const startQuiz = () => {
    if (selectedCategory && selectedSubject) {
      const categoryData = mockTestsDatabase[selectedCategory as keyof typeof mockTestsDatabase];
      let selectedQuestions = categoryData?.[selectedSubject as keyof typeof categoryData] || [];
      
      // Expand questions for NEET, JEE, JKSSB
      if (['neetFoundation', 'jee', 'jkssb'].includes(selectedCategory)) {
        selectedQuestions = expandQuestions(selectedQuestions);
      }
      
      // Get random 10+ questions from the pool
      const shuffled = [...selectedQuestions].sort(() => 0.5 - Math.random());
      const randomQuestions = shuffled.slice(0, Math.min(10, shuffled.length));
      
      setQuestions(randomQuestions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setStage('quiz');
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStage('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  const restartQuiz = () => {
    setStage('filter');
    setSelectedCategory('');
    setSelectedSubject('');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const currentQuestion = questions[currentQuestionIndex];
  const { correct, total } = calculateResults();
  const percentage = Math.round((correct / total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 sm:py-6 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2 hover:bg-white/20 px-2 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base flex-shrink-0"
          >
            <ArrowLeft size={18} className="sm:size-{20}" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center flex-1">Mock Tests & Q&A Practice</h1>
          <div className="w-12 sm:w-20 flex-shrink-0"></div>
        </div>
      </div>

      {/* Filter Stage */}
      {stage === 'filter' && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Select Your Exam & Subject</h2>

            {/* Category Selection */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Select Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {/* Classes */}
                {Object.entries(classMappings).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedCategory(key);
                      setSelectedSubject('');
                    }}
                    className={`p-2 sm:p-4 rounded-lg font-semibold transition-all text-xs sm:text-sm lg:text-base ${
                      selectedCategory === key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                {/* Exam Types */}
                <button
                  onClick={() => {
                    setSelectedCategory('neetFoundation');
                    setSelectedSubject('');
                  }}
                  className={`p-2 sm:p-4 rounded-lg font-semibold transition-all text-xs sm:text-sm lg:text-base ${
                    selectedCategory === 'neetFoundation'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  NEET
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('jee');
                    setSelectedSubject('');
                  }}
                  className={`p-2 sm:p-4 rounded-lg font-semibold transition-all text-xs sm:text-sm lg:text-base ${
                    selectedCategory === 'jee'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  JEE
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('jkssb');
                    setSelectedSubject('');
                  }}
                  className={`p-2 sm:p-4 rounded-lg font-semibold transition-all text-xs sm:text-sm lg:text-base ${
                    selectedCategory === 'jkssb'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  JKSSB
                </button>
              </div>
            </div>

            {/* Subject Selection */}
            {selectedCategory && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Select Subject</h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {getSubjects().map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`p-2 sm:p-4 rounded-lg font-semibold transition-all text-xs sm:text-sm lg:text-base ${
                        selectedSubject === subject
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            <div className="flex justify-center mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200\">
              <button
                onClick={startQuiz}
                disabled={!selectedCategory || !selectedSubject}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-white text-sm sm:text-base lg:text-lg transition-all ${
                  !selectedCategory || !selectedSubject
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg transform hover:scale-105'
                }`}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Stage */}
      {stage === 'quiz' && currentQuestion && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2">
                <span className="font-semibold text-xs sm:text-sm lg:text-base text-gray-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 break-words">
                  {selectedCategory.startsWith('class')
                    ? classMappings[selectedCategory as keyof typeof classMappings]
                    : selectedCategory === 'neetFoundation'
                    ? 'NEET Foundation'
                    : selectedCategory === 'jee'
                    ? 'JEE'
                    : 'JKSSB'}{' '}
                  - {selectedSubject}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div
                  className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-6 leading-snug">{currentQuestion.question}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">Topic: {currentQuestion.topic}</p>

              {/* Options */}
              <div className="space-y-2 sm:space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 font-semibold transition-all text-xs sm:text-sm lg:text-base ${
                      answers[currentQuestionIndex] === index
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-blue-300'
                    }`}
                  >
                    <span className="mr-2 sm:mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 pt-4 sm:pt-0">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transition-all text-sm sm:text-base"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && (
        <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8">Quiz Complete!</h2>

            {/* Score Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="relative w-32 sm:w-40 h-32 sm:h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="8"
                      strokeDasharray={`${(percentage / 100) * 345.575} 345.575`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">{percentage}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Correct</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{correct}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{total}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Wrong</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{total - correct}</p>
                </div>
              </div>
            </div>

            {/* Detailed Review */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Question Review</h3>
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                {questions.map((question, index) => {
                  const isCorrect = answers[index] === question.correctAnswer;
                  return (
                    <div
                      key={question.id}
                      className={`p-2 sm:p-4 rounded-lg border-l-4 text-xs sm:text-sm ${
                        isCorrect
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {isCorrect ? (
                          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5 sm:mt-1 sm:w-5 sm:h-5" size={16} />
                        ) : (
                          <XCircle className="text-red-600 flex-shrink-0 mt-0.5 sm:mt-1 sm:w-5 sm:h-5" size={16} />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 break-words">Q{index + 1}: {question.question}</p>
                          <p className={`text-xs sm:text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'} break-words`}>
                            {isCorrect ? 'Correct' : `Wrong - Correct: ${question.options[question.correctAnswer]}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 sm:pt-0">
              <button
                onClick={restartQuiz}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <RotateCcw size={16} className="sm:size-{20}" />
                Retake Quiz
              </button>
              <button
                onClick={onBack}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all text-sm sm:text-base"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
