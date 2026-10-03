INSERT IGNORE INTO categories (name) VALUES ('Linux'), ('Git'), ('Docker');
INSERT IGNORE INTO topics (category_id, title, position)
SELECT id, 'Files and Folders', 1 FROM categories WHERE name = 'Linux';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT id, 'Navigating with pwd, ls and cd',
'pwd prints the folder you are standing in. ls lists what is inside it. cd moves you into another folder. Try: pwd, then ls, then cd .. to go up one level.', 1
FROM topics WHERE title = 'Files and Folders';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT id, 'Hidden files',
'In Linux, any file whose name starts with a dot is hidden from a normal ls. To see everything, use ls -a. Config files like .bashrc and .gitignore are hidden files.', 2
FROM topics WHERE title = 'Files and Folders';

INSERT IGNORE INTO lessons (topic_id, title, content, position)
SELECT id, 'Reading files with cat',
'cat prints a file to the screen. Example: cat notes.txt. For long files, less lets you scroll, and you press q to quit.', 3
FROM topics WHERE title = 'Files and Folders';

INSERT INTO challenges (category_id, title, description, difficulty, xp_reward, flag_hash)
SELECT id,
  'Hidden File',
  'A file with a secret is hiding in your home directory. Normal ls will not show it. Find it, read it, and submit the flag.',
  'easy', 50, SHA2('CTFQUEST{h1dd3n_f1l3_f0und}', 256)
FROM categories WHERE name = 'Linux'
AND NOT EXISTS (SELECT 1 FROM challenges WHERE title = 'Hidden File');
INSERT IGNORE INTO hints (challenge_id, level, content)
SELECT id, 1, 'In Linux, a file whose name starts with a dot is hidden from a normal ls.' FROM challenges WHERE title = 'Hidden File';

INSERT IGNORE INTO hints (challenge_id, level, content)
SELECT id, 2, 'The secret lives in your home directory. Look there, and look for names that start with a dot.' FROM challenges WHERE title = 'Hidden File';

INSERT IGNORE INTO hints (challenge_id, level, content)
SELECT id, 3, 'ls has an option that shows all files, including hidden ones. It is a single letter: a.' FROM challenges WHERE title = 'Hidden File';

INSERT IGNORE INTO hints (challenge_id, level, content)
SELECT id, 4, 'After ls -a you will see extra names beginning with a dot, such as .bashrc. The odd one out that is not a normal config file is your target. Read it with cat.' FROM challenges WHERE title = 'Hidden File';

INSERT IGNORE INTO hints (challenge_id, level, content)
SELECT id, 5, 'Run: ls -a to list everything, find the hidden secret file, then run: cat .<filename> and submit the text it prints as the flag.' FROM challenges WHERE title = 'Hidden File';
INSERT IGNORE INTO badges (code, name, description) VALUES
('first_solve', 'First Solve', 'Solve your first challenge'),
('no_hints', 'No Hints', 'Solve a challenge without using any hint'),
('streak_3', '3-Day Streak', 'Solve challenges 3 days in a row');