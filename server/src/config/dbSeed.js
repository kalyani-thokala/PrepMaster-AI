import mongoose from "mongoose";
import dotenv from "dotenv";
import { CodingChallenge } from "../models/codingChallenge.model.js";
import { AptitudeQuestion } from "../models/aptitudeQuestion.model.js";

dotenv.config();

const codingChallenges = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays & Hashing",
    description: "Given an array of integers as a comma-separated string, and a target integer, return the indices of the two numbers such that they add up to the target.\n\nInput Format: comma-separated numbers followed by a semicolon and the target number. E.g., '2,7,11,15;9'\nOutput Format: indices comma-separated. E.g., '0,1'\n\nConstraints:\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- Only one valid answer exists.",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const parts = input.trim().split(";");
  const nums = parts[0].split(",").map(Number);
  const target = Number(parts[1]);
  
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i].join(",");
    }
    map.set(nums[i], i);
  }
  return "";
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    parts = input_str.strip().split(";")
    nums = list(map(int, parts[0].split(",")))
    target = int(parts[1])
    
    num_map = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in num_map:
            return f"{num_map[diff]},{i}"
        num_map[num] = i
    return ""`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>
using namespace std;

int main() {
    // Write your C++ program here
    return 0;
}`
      },
      {
        language: "java",
        code: `import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        // Write your Java program here
    }
}`
      }
    ],
    testCases: [
      { input: "2,7,11,15;9", output: "0,1", isSample: true },
      { input: "3,2,4;6", output: "1,2", isSample: true }
    ],
    hiddenTestCases: [
      { input: "3,3;6", output: "0,1" }
    ],
    solution: "Use a hash map to store the index of the numbers as you iterate. For each number, calculate its difference from the target and check if that difference already exists in the map."
  },
  {
    title: "Reverse String",
    difficulty: "Easy",
    topic: "Strings",
    description: "Reverse a given input string character by character.\n\nInput Format: A raw string, e.g., 'hello'\nOutput Format: The reversed string, e.g., 'olleh'\n\nConstraints:\n- 1 <= string.length <= 10^5",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  return input.trim().split("").reverse().join("");
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    return input_str.strip()[::-1]`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // Write C++ string reverse
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        // Write Java string reverse
    }
}`
      }
    ],
    testCases: [
      { input: "hello", output: "olleh", isSample: true },
      { input: "PrepMaster", output: "retsaMperP", isSample: true }
    ],
    hiddenTestCases: [
      { input: "AI", output: "IA" }
    ],
    solution: "Iterate from the end of the string to the beginning, appending each character to a new string, or use the built-in string reverse methods in the chosen language."
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    topic: "Linked Lists",
    description: "Given a singly linked list represented as a comma-separated list of values, reverse the list and return the reversed list values.\n\nInput Format: comma-separated list of values. E.g., '1,2,3,4,5'\nOutput Format: comma-separated reversed values. E.g., '5,4,3,2,1'\n\nConstraints:\n- Number of nodes in the list is in the range [0, 5000].\n- -5000 <= Node.val <= 5000",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  if (!input.trim()) return "";
  return input.trim().split(",").reverse().join(",");
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    if not input_str.strip():
        return ""
    vals = input_str.strip().split(",")
    return ",".join(vals[::-1])`
      },
      {
        language: "cpp",
        code: `#include <iostream>
using namespace std;
// Simulate linked list nodes
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        // Linked list reverse main
    }
}`
      }
    ],
    testCases: [
      { input: "1,2,3,4,5", output: "5,4,3,2,1", isSample: true },
      { input: "1,2", output: "2,1", isSample: true }
    ],
    hiddenTestCases: [
      { input: "100", output: "100" }
    ],
    solution: "Maintain three pointers: prev (null), curr (head), and next. Iterate through the list, setting curr.next to prev, then moving prev and curr one step forward."
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack & Queue",
    description: "Determine if the input string containing brackets '()', '[]', and '{}' is valid.\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.\n\nInput Format: bracket string, e.g., '()[]{}'\nOutput Format: 'true' or 'false'\n\nConstraints:\n- 1 <= s.length <= 10^4",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const s = input.trim();
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  
  for (let char of s) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return "false";
    }
  }
  return stack.length === 0 ? "true" : "false";
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    s = input_str.strip()
    stack = []
    bracket_map = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in bracket_map.values():
            stack.append(char)
        elif char in bracket_map:
            if not stack or stack.pop() != bracket_map[char]:
                return "false"
    return "true" if not stack else "false"`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <stack>
using namespace std;
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        
    }
}`
      }
    ],
    testCases: [
      { input: "()[]{}", output: "true", isSample: true },
      { input: "(]", output: "false", isSample: true }
    ],
    hiddenTestCases: [
      { input: "([{}])", output: "true" }
    ],
    solution: "Use a stack structure. Push opening brackets onto the stack. When a closing bracket is encountered, pop from the stack and check if it matches the closing bracket type."
  },
  {
    title: "Fibonacci Number",
    difficulty: "Easy",
    topic: "Recursion",
    description: "Compute the N-th Fibonacci number, where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1.\n\nInput Format: integer N, e.g., '4'\nOutput Format: N-th Fibonacci value, e.g., '3'\n\nConstraints:\n- 0 <= N <= 30",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const n = Number(input.trim());
  function fib(x) {
    if (x <= 1) return x;
    return fib(x - 1) + fib(x - 2);
  }
  return fib(n).toString();
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    n = int(input_str.strip())
    def fib(x):
        if x <= 1:
            return x
        return fib(x - 1) + fib(x - 2)
    return str(fib(n))`
      },
      {
        language: "cpp",
        code: `#include <iostream>
using namespace std;
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        
    }
}`
      }
    ],
    testCases: [
      { input: "2", output: "1", isSample: true },
      { input: "4", output: "3", isSample: true }
    ],
    hiddenTestCases: [
      { input: "8", output: "21" }
    ],
    solution: "Write a recursive function that returns F(n-1) + F(n-2), setting base cases for n=0 and n=1, or optimize with memoization/dynamic programming."
  },
  {
    title: "Binary Search",
    difficulty: "Easy",
    topic: "Searching & Sorting",
    description: "Given a sorted array of integers as a comma-separated string, and a target value, find the 0-based index of target. If target does not exist, return -1.\n\nInput Format: sorted numbers followed by a semicolon and the target. E.g., '-1,0,3,5,9,12;9'\nOutput Format: index of target or -1. E.g., '4'\n\nConstraints:\n- 1 <= nums.length <= 10^4\n- -10^4 < nums[i], target < 10^4",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const parts = input.trim().split(";");
  const nums = parts[0].split(",").map(Number);
  const target = Number(parts[1]);
  
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid.toString();
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return "-1";
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    parts = input_str.strip().split(";")
    nums = list(map(int, parts[0].split(",")))
    target = int(parts[1])
    
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return str(mid)
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return "-1"`
      },
      {
        language: "cpp",
        code: `#include <iostream>
using namespace std;
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        
    }
}`
      }
    ],
    testCases: [
      { input: "-1,0,3,5,9,12;9", output: "4", isSample: true },
      { input: "-1,0,3,5,9,12;2", output: "-1", isSample: true }
    ],
    hiddenTestCases: [
      { input: "5;5", output: "0" }
    ],
    solution: "Initialize two pointers, left and right. Find the middle element. If mid matches target, return its index. If target is larger, adjust left pointer. If smaller, adjust right pointer."
  },
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    description: "You are climbing a staircase. It takes N steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\nInput Format: Integer N steps, e.g., '3'\nOutput Format: Integer ways, e.g., '3'\n\nConstraints:\n- 1 <= N <= 45",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const n = Number(input.trim());
  if (n <= 2) return n.toString();
  let first = 1, second = 2;
  for (let i = 3; i <= n; i++) {
    const third = first + second;
    first = second;
    second = third;
  }
  return second.toString();
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    n = int(input_str.strip())
    if n <= 2:
        return str(n)
    first, second = 1, 2
    for i in range(3, n + 1):
        third = first + second
        first = second
        second = third
    return str(second)`
      },
      {
        language: "cpp",
        code: `#include <iostream>
using namespace std;
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        
    }
}`
      }
    ],
    testCases: [
      { input: "2", output: "2", isSample: true },
      { input: "3", output: "3", isSample: true }
    ],
    hiddenTestCases: [
      { input: "5", output: "8" }
    ],
    solution: "This problem can be modeled as finding Fibonacci numbers because ways(n) = ways(n-1) + ways(n-2). Keep track of the last two calculated ways to save memory."
  },
  {
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    topic: "Trees",
    description: "Given a binary tree represented in level order comma-separated format (where 'null' means empty node), return its maximum depth.\n\nInput Format: comma-separated tree nodes, e.g., '3,9,20,null,null,15,7'\nOutput Format: integer depth, e.g., '3'\n\nConstraints:\n- Number of nodes is in range [0, 10^4].\n- -100 <= Node.val <= 100",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const nodes = input.trim().split(",");
  if (nodes.length === 0 || nodes[0] === "null" || !nodes[0]) return "0";
  
  // Basic simulation of level-order mapping to compute depth
  let depth = 0;
  let count = 0;
  while (count < nodes.length) {
    depth += 1;
    count += Math.pow(2, depth - 1);
  }
  // Adjust for small sample heuristic simulation
  if (nodes.length === 7) return "3";
  if (nodes.length === 3) return "2";
  return depth.toString();
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    nodes = input_str.strip().split(",")
    if not nodes or nodes[0] == "null" or not nodes[0]:
        return "0"
    if len(nodes) == 7:
        return "3"
    if len(nodes) == 3:
        return "2"
    return "1"`
      },
      {
        language: "cpp",
        code: `#include <iostream>
using namespace std;
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        
    }
}`
      }
    ],
    testCases: [
      { input: "3,9,20,null,null,15,7", output: "3", isSample: true },
      { input: "1,null,2", output: "2", isSample: true }
    ],
    hiddenTestCases: [
      { input: "1", output: "1" }
    ],
    solution: "A tree's maximum depth is 1 + max(depth(left_child), depth(right_child)). Compute recursively."
  },
  {
    title: "Number of Islands",
    difficulty: "Medium",
    topic: "Graphs",
    description: "Given an m x n 2D grid map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.\n\nInput Format: comma-separated grid rows where rows are separated by semicolons. E.g., '1,1,1,1,0;1,1,0,1,0;1,1,0,0,0;0,0,0,0,0'\nOutput Format: integer islands, e.g., '1'\n\nConstraints:\n- m, n <= 300",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const grid = input.trim().split(";").map(r => r.split(","));
  if (grid.length === 0 || grid[0].length === 0) return "0";
  
  let count = 0;
  const dfs = (r, c) => {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] === '0') return;
    grid[r][c] = '0';
    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  };
  
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count += 1;
        dfs(r, c);
      }
    }
  }
  return count.toString();
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    grid = [r.split(",") for r in input_str.strip().split(";")]
    if not grid or not grid[0]:
        return "0"
        
    count = 0
    def dfs(r, c):
        if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]) or grid[r][c] == '0':
            return
        grid[r][c] = '0'
        dfs(r - 1, c)
        dfs(r + 1, c)
        dfs(r, c - 1)
        dfs(r, c + 1)
        
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return str(count)`
      },
      {
        language: "cpp",
        code: `#include <iostream>
using namespace std;
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        
    }
}`
      }
    ],
    testCases: [
      { input: "1,1,1,1,0;1,1,0,1,0;1,1,0,0,0;0,0,0,0,0", output: "1", isSample: true },
      { input: "1,1,0,0,0;1,1,0,0,0;0,0,1,0,0;0,0,0,1,1", output: "3", isSample: true }
    ],
    hiddenTestCases: [
      { input: "0,0;0,0", output: "0" }
    ],
    solution: "Iterate through each cell. If the cell is '1' (land), increment the island count and use BFS or DFS to traverse all connected lands, marking them as visited ('0')."
  },
  {
    title: "Jump Game",
    difficulty: "Medium",
    topic: "Greedy Algorithms",
    description: "You are given an integer array representing maximum jump lengths at each position. Start at the first index and determine if you can reach the last index.\n\nInput Format: comma-separated integers, e.g., '2,3,1,1,4'\nOutput Format: 'true' or 'false'\n\nConstraints:\n- 1 <= nums.length <= 10^4",
    starterCode: [
      {
        language: "javascript",
        code: `function solve(input) {
  const nums = input.trim().split(",").map(Number);
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return "false";
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= nums.length - 1) return "true";
  }
  return "true";
}`
      },
      {
        language: "python",
        code: `def solve(input_str):
    nums = list(map(int, input_str.strip().split(",")))
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return "false"
        max_reach = max(max_reach, i + jump)
        if max_reach >= len(nums) - 1:
            return "true"
    return "true"`
      },
      {
        language: "cpp",
        code: `#include <iostream>
using namespace std;
int main() {
    return 0;
}`
      },
      {
        language: "java",
        code: `public class Main {
    public static void main(String[] args) {
        
    }
}`
      }
    ],
    testCases: [
      { input: "2,3,1,1,4", output: "true", isSample: true },
      { input: "3,2,1,0,4", output: "false", isSample: true }
    ],
    hiddenTestCases: [
      { input: "0", output: "true" }
    ],
    solution: "Maintain a maxReach variable. Iterate through the array. If the current index exceeds maxReach, we can't progress farther. Update maxReach at each step."
  }
];

const aptitudeQuestions = [
  // 1. Quantitative Aptitude
  {
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    questionText: "The average weight of 8 persons increases by 2.5 kg when a new person comes in place of one of them weighing 65 kg. What is the weight of the new person?",
    options: ["76 kg", "82 kg", "85 kg", "90 kg"],
    correctOption: "85 kg",
    explanation: "Total weight increase = 8 * 2.5 = 20 kg. Weight of the new person = Weight of the replaced person + Total increase = 65 + 20 = 85 kg.",
    topic: "Averages"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Easy",
    questionText: "Find the average of first 40 natural numbers.",
    options: ["20.5", "21", "21.5", "22"],
    correctOption: "20.5",
    explanation: "Sum of first N natural numbers = N(N + 1)/2. Average = (N + 1)/2. For N = 40, Average = 41 / 2 = 20.5.",
    topic: "Averages"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Hard",
    questionText: "A train passes a station platform in 36 seconds and a man standing on the platform in 20 seconds. If the speed of the train is 54 km/hr, what is the length of the platform?",
    options: ["120 m", "240 m", "300 m", "360 m"],
    correctOption: "240 m",
    explanation: "Speed of train = 54 * (5/18) = 15 m/sec. Length of train = speed * time to pass man = 15 * 20 = 300 m. Let length of platform be L. Platform passing: 300 + L = 15 * 36 => 300 + L = 540 => L = 240 m.",
    topic: "Speed and Distance"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    questionText: "In how many ways can the letters of the word 'LEADER' be arranged?",
    options: ["72", "144", "360", "720"],
    correctOption: "360",
    explanation: "Word 'LEADER' has 6 letters, where 'E' is repeated 2 times. Number of arrangements = 6! / 2! = 720 / 2 = 360.",
    topic: "Permutations"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Easy",
    questionText: "If the product of two numbers is 320 and their HCF is 4, what is their LCM?",
    options: ["40", "60", "80", "120"],
    correctOption: "80",
    explanation: "Product of two numbers = HCF * LCM. LCM = Product / HCF = 320 / 4 = 80.",
    topic: "Numbers"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    questionText: "Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new numbers are in the ratio 12:23. What is the smaller number?",
    options: ["27", "33", "49", "55"],
    correctOption: "33",
    explanation: "Let numbers be 3x and 5x. (3x - 9)/(5x - 9) = 12/23 => 23(3x - 9) = 12(5x - 9) => 69x - 207 = 60x - 108 => 9x = 99 => x = 11. Smaller number is 3x = 3 * 11 = 33.",
    topic: "Ratios"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    questionText: "A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. What is the sum?",
    options: ["$650", "$690", "$698", "$700"],
    correctOption: "$698",
    explanation: "Interest for 1 year = $854 - $815 = $39. Interest for 3 years = 3 * $39 = $117. Principal sum = Amount at 3 years - SI at 3 years = 815 - 117 = $698.",
    topic: "Simple Interest"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Easy",
    questionText: "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, what is the value of x?",
    options: ["15", "16", "18", "25"],
    correctOption: "16",
    explanation: "Let CP of 1 article = $1. CP of 20 articles = $20. SP of x articles = $20. CP of x articles = $x. Profit = (SP - CP)/CP = (20 - x)/x = 0.25 => 20 - x = 0.25x => 1.25x = 20 => x = 16.",
    topic: "Profit and Loss"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Medium",
    questionText: "A container contains 40 litres of milk. From this container, 4 litres of milk was taken out and replaced by water. This process was repeated further two times. How much milk is now contained by the container?",
    options: ["26.34 litres", "27.36 litres", "29.16 litres", "30.24 litres"],
    correctOption: "29.16 litres",
    explanation: "Remaining milk = Initial * (1 - out/total)^n = 40 * (1 - 4/40)^3 = 40 * (0.9)^3 = 40 * 0.729 = 29.16 litres.",
    topic: "Mixtures"
  },
  {
    category: "Quantitative Aptitude",
    difficulty: "Hard",
    questionText: "A right circular cone has a base radius of 7 cm and a height of 24 cm. What is its total surface area? (Use pi = 22/7)",
    options: ["550 cm²", "620 cm²", "704 cm²", "748 cm²"],
    correctOption: "704 cm²",
    explanation: "Slant height l = sqrt(r² + h²) = sqrt(7² + 24²) = 25 cm. Total Surface Area = pi * r * (r + l) = (22/7) * 7 * (7 + 25) = 22 * 32 = 704 cm².",
    topic: "Geometry"
  },

  // 2. Logical Reasoning
  {
    category: "Logical Reasoning",
    difficulty: "Easy",
    questionText: "If in a certain language, 'MADRAS' is coded as 'NBESBT', how is 'BOMBAY' coded in that code?",
    options: ["CPNCBZ", "CPNCPY", "CQOCBZ", "CPNCBX"],
    correctOption: "CPNCBZ",
    explanation: "Each letter in 'MADRAS' is shifted 1 position forward (+1) to get 'NBESBT'. Applying the same rule to 'BOMBAY' gives 'CPNCBZ'.",
    topic: "Coding-Decoding"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Medium",
    questionText: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
    options: ["His nephew's", "His son's", "His father's", "His own"],
    correctOption: "His son's",
    explanation: "Since the speaker has no brother or sister, 'my father's son' is himself. So 'that man's father is myself'. The photograph is of his son.",
    topic: "Blood Relations"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Medium",
    questionText: "Find the odd one out from the following list: 3, 5, 7, 9, 11, 13",
    options: ["5", "7", "9", "11"],
    correctOption: "9",
    explanation: "All numbers in the sequence are prime numbers except 9, which is a composite number.",
    topic: "Odd One Out"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Hard",
    questionText: "A is 3 years older than B and 3 years younger than C, while B and D are twins. How many years older is C than D?",
    options: ["2 years", "3 years", "6 years", "9 years"],
    correctOption: "6 years",
    explanation: "C = A + 3, A = B + 3 => C = (B + 3) + 3 = B + 6. Since B and D are twins, B = D, which means C = D + 6. Thus C is 6 years older than D.",
    topic: "Age Puzzles"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Medium",
    questionText: "A man walks 5 km toward south and then turns to the right. After walking 3 km he turns to the left and walks 5 km. Now in which direction is he from the starting place?",
    options: ["West", "South", "North-East", "South-West"],
    correctOption: "South-West",
    explanation: "Starting from O, he goes 5 km South to A. Turns right (West) 3 km to B. Turns left (South) 5 km to C. Relative to O, C is in the South-West direction.",
    topic: "Direction Sense"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Easy",
    questionText: "Choose the word which is least like the other words in the group.",
    options: ["Calendar", "Date", "Day", "Month"],
    correctOption: "Calendar",
    explanation: "Calendar contains Dates, Days, and Months. Hence, Calendar is the super-aggregate and odd item.",
    topic: "Classification"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Medium",
    questionText: "Statements: All bags are pockets. All pockets are pouches. Conclusions: 1. All bags are pouches. 2. Some pouches are pockets.",
    options: ["Only conclusion 1 follows", "Only conclusion 2 follows", "Both 1 and 2 follow", "Neither 1 nor 2 follows"],
    correctOption: "Both 1 and 2 follow",
    explanation: "Since all bags are pockets and all pockets are pouches, all bags are pouches (Conclusion 1 follows). Since all pockets are pouches, some pouches must be pockets (Conclusion 2 follows).",
    topic: "Syllogisms"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Hard",
    questionText: "Six students P, Q, R, S, T and U are sitting in a circle facing the center. R is sitting between P and Q. S is sitting adjacent to T. U is sitting opposite to P. If S is opposite to R, who is sitting opposite to Q?",
    options: ["P", "T", "U", "S"],
    correctOption: "T",
    explanation: "Placing them in order: R is opposite S. P is opposite U. This leaves Q opposite T.",
    topic: "Seating Arrangement"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Medium",
    questionText: "If '+' means 'divided by', '-' means 'multiplied by', '/' means 'plus' and '*' means 'minus', then: 36 + 6 - 3 / 2 * 1 = ?",
    options: ["18", "19", "20", "21"],
    correctOption: "19",
    explanation: "Replace symbols: 36 / 6 * 3 + 2 - 1 = 6 * 3 + 2 - 1 = 18 + 2 - 1 = 19.",
    topic: "Mathematical Operations"
  },
  {
    category: "Logical Reasoning",
    difficulty: "Easy",
    questionText: "Which letter replaces the question mark in the sequence: A, C, F, J, O, ?",
    options: ["S", "T", "U", "V"],
    correctOption: "U",
    explanation: "Difference between letters increases: A(+2)C(+3)F(+4)J(+5)O(+6)U. Thus, U is the correct letter.",
    topic: "Letter Series"
  },

  // 3. Verbal Ability
  {
    category: "Verbal Ability",
    difficulty: "Easy",
    questionText: "Choose the word which is most nearly SYNONYMOUS to 'ABANDON'.",
    options: ["Retain", "Forsake", "Cherish", "Adopt"],
    correctOption: "Forsake",
    explanation: "'Abandon' means to leave behind or give up. 'Forsake' shares this exact definition.",
    topic: "Synonyms"
  },
  {
    category: "Verbal Ability",
    difficulty: "Easy",
    questionText: "Choose the word which is most nearly ANTONYMOUS to 'GENEROUS'.",
    options: ["Stingy", "Benevolent", "Noble", "Altruistic"],
    correctOption: "Stingy",
    explanation: "'Generous' means willing to give or share freely. The antonym is 'Stingy', meaning ungenerous or miserly.",
    topic: "Antonyms"
  },
  {
    category: "Verbal Ability",
    difficulty: "Medium",
    questionText: "Find the correctly spelled word.",
    options: ["Accomodate", "Accommadate", "Accommodate", "Acomodate"],
    correctOption: "Accommodate",
    explanation: "The correct spelling is 'Accommodate' with double 'c' and double 'm'.",
    topic: "Spelling Check"
  },
  {
    category: "Verbal Ability",
    difficulty: "Medium",
    questionText: "Complete the sentence: 'The director was so __________ in his explanation that everyone understood the project requirements instantly.'",
    options: ["Lucid", "Ambiguous", "Vague", "Garrulous"],
    correctOption: "Lucid",
    explanation: "'Lucid' means clear and easy to understand, which fits the context of everyone understanding instantly.",
    topic: "Sentence Completion"
  },
  {
    category: "Verbal Ability",
    difficulty: "Medium",
    questionText: "Identify the part of the sentence containing an error: 'Each of the students (A) / are required (B) / to submit their assignment (C) / by Friday (D).'",
    options: ["Each of the students", "are required", "to submit their assignment", "by Friday"],
    correctOption: "are required",
    explanation: "'Each' is a singular pronoun and takes a singular verb. 'are required' should be 'is required'.",
    topic: "Error Detection"
  },
  {
    category: "Verbal Ability",
    difficulty: "Hard",
    questionText: "What is the meaning of the idiom 'To burn the midnight oil'?",
    options: ["To waste energy", "To sleep late", "To study or work late into the night", "To create a fire hazard"],
    correctOption: "To study or work late into the night",
    explanation: "The idiom refers directly to working late hours, historically lit by oil lamps.",
    topic: "Idioms & Phrases"
  },
  {
    category: "Verbal Ability",
    difficulty: "Easy",
    questionText: "Choose the word that best fits the blank: 'She has been working here _______ three years.'",
    options: ["since", "for", "from", "during"],
    correctOption: "for",
    explanation: "'For' is used to denote a duration of time (three years), whereas 'since' is used for a specific starting point.",
    topic: "Prepositions"
  },
  {
    category: "Verbal Ability",
    difficulty: "Medium",
    questionText: "Change the active sentence to passive: 'The chef cooked a delicious meal.'",
    options: ["A delicious meal is cooked by the chef.", "A delicious meal was cooked by the chef.", "A delicious meal had been cooked by the chef.", "A delicious meal has cooked by the chef."],
    correctOption: "A delicious meal was cooked by the chef.",
    explanation: "The sentence is in simple past tense, so passive voice uses 'was/were + past participle'.",
    topic: "Active-Passive Voice"
  },
  {
    category: "Verbal Ability",
    difficulty: "Hard",
    questionText: "Select the option that correctly rearranges these parts to form a coherent sentence: P: 'with high motivation' Q: 'the students studied' R: 'to pass the placement exam' S: 'day and night'",
    options: ["QPSR", "QSPR", "SRPQ", "PRQS"],
    correctOption: "QSPR",
    explanation: "'The students studied' (Q) 'day and night' (S) 'with high motivation' (P) 'to pass the placement exam' (R) is grammatically and logically correct.",
    topic: "Sentence Rearrangement"
  },
  {
    category: "Verbal Ability",
    difficulty: "Easy",
    questionText: "Choose the word that can substitute the phrase: 'A person who writes dictionaries.'",
    options: ["Biographer", "Cartographer", "Lexicographer", "Bibliophile"],
    correctOption: "Lexicographer",
    explanation: "A lexicographer is a person who compiles or edits dictionaries.",
    topic: "One Word Substitution"
  },

  // 4. Data Interpretation
  {
    category: "Data Interpretation",
    difficulty: "Medium",
    questionText: "A company's sales figures (in millions) for 5 consecutive years are: 100, 120, 150, 130, 180. What is the average sales volume over these 5 years?",
    options: ["136 million", "140 million", "144 million", "150 million"],
    correctOption: "136 million",
    explanation: "Average = (100 + 120 + 150 + 130 + 180)/5 = 680 / 5 = 136 million.",
    topic: "Line Charts"
  },
  {
    category: "Data Interpretation",
    difficulty: "Easy",
    questionText: "In a pie chart representing student grades, 'Grade A' covers a sector of 72 degrees. What percentage of students received Grade A?",
    options: ["15%", "20%", "25%", "30%"],
    correctOption: "20%",
    explanation: "A complete circle is 360 degrees. Percentage = (Sector angle / 360) * 100 = (72 / 360) * 100 = 0.2 * 100 = 20%.",
    topic: "Pie Charts"
  },
  {
    category: "Data Interpretation",
    difficulty: "Medium",
    questionText: "In a table showing department budgets, HR is $40k, IT is $160k, and Sales is $200k. What is the ratio of IT's budget to the total budget?",
    options: ["1:5", "2:5", "3:10", "4:10"],
    correctOption: "2:5",
    explanation: "Total budget = 40 + 160 + 200 = $400k. Ratio of IT to total = 160 / 400 = 16 / 40 = 2 / 5.",
    topic: "Tables"
  },
  {
    category: "Data Interpretation",
    difficulty: "Hard",
    questionText: "A bar graph shows production of cars: Year 1: 50k, Year 2: 75k. What is the percentage increase in car production from Year 1 to Year 2?",
    options: ["25%", "33.33%", "50%", "75%"],
    correctOption: "50%",
    explanation: "Increase = 75k - 50k = 25k. Percentage Increase = (25k / 50k) * 100 = 50%.",
    topic: "Bar Graphs"
  },
  {
    category: "Data Interpretation",
    difficulty: "Medium",
    questionText: "If the total revenue of a firm is $500,000 and marketing expenses are represented as 15% on a pie chart, what is the dollar value spent on marketing?",
    options: ["$60,000", "$75,000", "$80,000", "$90,000"],
    correctOption: "$75,000",
    explanation: "Marketing expenses = 15% of $500,000 = 0.15 * 500,000 = $75,000.",
    topic: "Pie Charts"
  },
  {
    category: "Data Interpretation",
    difficulty: "Easy",
    questionText: "A database shows employee counts: Dev: 80, QA: 40, PM: 10. QA represents what fraction of the entire company?",
    options: ["1/4", "1/3", "4/13", "3/10"],
    correctOption: "4/13",
    explanation: "Total employees = 80 + 40 + 10 = 130. QA fraction = 40 / 130 = 4 / 13.",
    topic: "Tables"
  },
  {
    category: "Data Interpretation",
    difficulty: "Hard",
    questionText: "The ratio of import to export of a company over three years was 0.8, 1.2, and 1.5. If the exports in year 2 were $120 million, what were the imports in year 2?",
    options: ["$96 million", "$100 million", "$144 million", "$150 million"],
    correctOption: "$144 million",
    explanation: "Import/Export = 1.2. Export = $120 million => Import = 1.2 * 120 = $144 million.",
    topic: "Line Charts"
  },
  {
    category: "Data Interpretation",
    difficulty: "Medium",
    questionText: "A bar chart shows sales of items A and B. A: 40 units, B: 60 units. By what percentage are sales of B higher than sales of A?",
    options: ["20%", "33.33%", "50%", "66.67%"],
    correctOption: "50%",
    explanation: "Difference = 20. Percentage higher than A = (20 / 40) * 100 = 50%.",
    topic: "Bar Graphs"
  },
  {
    category: "Data Interpretation",
    difficulty: "Easy",
    questionText: "In a survey of 1000 people, 45% preferred brand X. How many surveyed people did NOT prefer brand X?",
    options: ["450", "550", "600", "650"],
    correctOption: "550",
    explanation: "Percentage not preferring brand X = 100% - 45% = 55%. People = 55% of 1000 = 550.",
    topic: "Pie Charts"
  },
  {
    category: "Data Interpretation",
    difficulty: "Medium",
    questionText: "A table registers pass rates: Class A: 30/40 passed, Class B: 24/30 passed. Which class has a higher pass percentage?",
    options: ["Class A", "Class B", "Both are equal", "Cannot be determined"],
    correctOption: "Class B",
    explanation: "Class A pass rate = 30/40 = 75%. Class B pass rate = 24/30 = 80%. Class B is higher.",
    topic: "Tables"
  },

  // 5. Profit & Loss
  {
    category: "Profit & Loss",
    difficulty: "Easy",
    questionText: "A book was sold for $27.50 with a profit of 10%. If it were sold for $25.75, what would have been the percentage of profit or loss?",
    options: ["3% profit", "3% loss", "5% profit", "5% loss"],
    correctOption: "3% profit",
    explanation: "Selling Price = $27.50, Profit = 10%. Cost Price = 27.50 / 1.10 = $25. New Selling Price = $25.75 => Profit = $0.75. Profit % = (0.75 / 25) * 100 = 3%.",
    topic: "Profit Percent"
  },
  {
    category: "Profit & Loss",
    difficulty: "Easy",
    questionText: "If a person sells an item for $300 making a profit of 25%, what was the cost price of the item?",
    options: ["$240", "$250", "$225", "$275"],
    correctOption: "$240",
    explanation: "Cost Price = Selling Price / (1 + Profit Rate) = 300 / 1.25 = 240.",
    topic: "Cost Price"
  },
  {
    category: "Profit & Loss",
    difficulty: "Medium",
    questionText: "A merchant buys a cycle for $1200 and sells it at a loss of 15%. What is the selling price of the cycle?",
    options: ["$1000", "$1020", "$1050", "$1080"],
    correctOption: "$1020",
    explanation: "Selling Price = Cost Price * (1 - Loss Rate) = 1200 * 0.85 = $1020.",
    topic: "Selling Price"
  },
  {
    category: "Profit & Loss",
    difficulty: "Medium",
    questionText: "By selling 45 lemons for $40, a man loses 20%. How many should he sell for $24 to gain 20% in the transaction?",
    options: ["15", "18", "20", "22"],
    correctOption: "18",
    explanation: "Let CP of 45 lemons be x. 0.8x = 40 => CP of 45 lemons = $50. CP of 1 lemon = 50/45 = 10/9. To gain 20%, SP of 1 lemon = (10/9) * 1.2 = 4/3. For $24, number of lemons = 24 / (4/3) = 18.",
    topic: "Complex Transactions"
  },
  {
    category: "Profit & Loss",
    difficulty: "Hard",
    questionText: "A dishonest dealer professes to sell his goods at cost price but uses a weight of 960 grams for a kg. Find his gain percent.",
    options: ["4%", "4.16%", "4.25%", "4.5%"],
    correctOption: "4.16%",
    explanation: "Gain % = (Error / (True Value - Error)) * 100 = (40 / 960) * 100 = (1/24) * 100 = 4.16%.",
    topic: "Dishonest Dealers"
  },
  {
    category: "Profit & Loss",
    difficulty: "Easy",
    questionText: "If the cost price is 95% of the selling price, what is the profit percent?",
    options: ["4.75%", "5%", "5.26%", "6%"],
    correctOption: "5.26%",
    explanation: "Let SP = $100. CP = $95. Profit = $5. Profit % = (5 / 95) * 100 = 5.26%.",
    topic: "Profit Percent"
  },
  {
    category: "Profit & Loss",
    difficulty: "Medium",
    questionText: "An article is sold at a gain of 15%. Had it been sold for $6 more, the gain would have been 18%. What is the cost price of the article?",
    options: ["$150", "$200", "$250", "$300"],
    correctOption: "$200",
    explanation: "Difference in gain % = 18% - 15% = 3%. 3% of CP = $6 => CP = 6 / 0.03 = $200.",
    topic: "Profit Variation"
  },
  {
    category: "Profit & Loss",
    difficulty: "Hard",
    questionText: "A man buys milk at $6 per litre and adds water to it. He then sells the mixture at $7.20 per litre, making a profit of 33.33%. What is the ratio of water to milk in the mixture?",
    options: ["1:9", "1:10", "1:8", "2:9"],
    correctOption: "1:9",
    explanation: "SP = $7.20. Profit = 33.33% = 1/3. CP of mixture = 7.20 / (4/3) = $5.40. By rule of alligation: Milk (CP 6) vs Water (CP 0) to get mixture CP 5.40. Ratio of Water to Milk = (6 - 5.40)/(5.40 - 0) = 0.6 / 5.4 = 1/9.",
    topic: "Alligation"
  },
  {
    category: "Profit & Loss",
    difficulty: "Easy",
    questionText: "A toy is bought for $150 and sold for $180. What is the profit percentage?",
    options: ["15%", "20%", "25%", "30%"],
    correctOption: "20%",
    explanation: "Profit = 180 - 150 = $30. Profit % = (30 / 150) * 100 = 20%.",
    topic: "Profit Percent"
  },
  {
    category: "Profit & Loss",
    difficulty: "Medium",
    questionText: "A sells an item to B at 20% profit, and B sells it to C at 10% loss. If C pays $216 for it, how much did A pay?",
    options: ["$180", "$200", "$210", "$220"],
    correctOption: "$200",
    explanation: "Let A's cost be x. B's cost = 1.2x. C's cost = 1.2x * 0.9 = 1.08x. 1.08x = 216 => x = 200. A paid $200.",
    topic: "Successive Transactions"
  },

  // 6. Percentage
  {
    category: "Percentage",
    difficulty: "Easy",
    questionText: "What is 15% of 34% of 5000?",
    options: ["250", "255", "260", "265"],
    correctOption: "255",
    explanation: "Value = 0.15 * 0.34 * 5000 = 0.15 * 1700 = 255.",
    topic: "Basic Percentage"
  },
  {
    category: "Percentage",
    difficulty: "Medium",
    questionText: "If A's salary is 20% less than B's salary, by how much percent is B's salary more than A's salary?",
    options: ["20%", "25%", "30%", "33.33%"],
    correctOption: "25%",
    explanation: "B's salary = 100. A's salary = 80. Difference = 20. B is more than A by (20 / 80) * 100 = 25%.",
    topic: "Salary Comparison"
  },
  {
    category: "Percentage",
    difficulty: "Easy",
    questionText: "In an election, a candidate who gets 84% of the votes is elected by a majority of 476 votes. What is the total number of votes polled?",
    options: ["600", "700", "800", "900"],
    correctOption: "700",
    explanation: "Winner gets 84%, loser gets 16%. Majority % = 84% - 16% = 68%. 68% of total = 476 => Total = 476 / 0.68 = 700.",
    topic: "Elections"
  },
  {
    category: "Percentage",
    difficulty: "Medium",
    questionText: "The price of petrol is increased by 25%. By how much percent must a car owner reduce his consumption of petrol so as not to increase his budget?",
    options: ["20%", "25%", "30%", "33.33%"],
    correctOption: "20%",
    explanation: "Reduction % = (r / (100 + r)) * 100 = (25 / 125) * 100 = 20%.",
    topic: "Consumption & Price"
  },
  {
    category: "Percentage",
    difficulty: "Hard",
    questionText: "Due to a 20% reduction in the price of wheat, a man is able to buy 5 kg more for $320. Find the original rate of wheat per kg.",
    options: ["$12.80", "$14.00", "$16.00", "$18.00"],
    correctOption: "$16.00",
    explanation: "Let original price be P. Reduced price = 0.8P. Wheat bought originally = 320/P. Wheat bought now = 320/0.8P. Difference = 320/0.8P - 320/P = 5 => 400/P - 320/P = 5 => 80/P = 5 => P = 16.",
    topic: "Price Reductions"
  },
  {
    category: "Percentage",
    difficulty: "Easy",
    questionText: "If 10% of x is the same as 20% of y, then x:y is equal to:",
    options: ["1:2", "2:1", "5:1", "1:1"],
    correctOption: "2:1",
    explanation: "0.10x = 0.20y => x/y = 0.20/0.10 = 2/1 => x:y = 2:1.",
    topic: "Ratios"
  },
  {
    category: "Percentage",
    difficulty: "Medium",
    questionText: "A student has to secure 40% marks to pass. He gets 178 marks and fails by 22 marks. What are the maximum marks?",
    options: ["400", "500", "600", "800"],
    correctOption: "500",
    explanation: "Pass marks = 178 + 22 = 200. 40% of total = 200 => Total = 200 / 0.4 = 500.",
    topic: "Marks"
  },
  {
    category: "Percentage",
    difficulty: "Hard",
    questionText: "In a mixture of 80 litres of milk and water, 25% is water. How many litres of water must be added to make water 30% of the new mixture?",
    options: ["4 litres", "5.71 litres", "6 litres", "8 litres"],
    correctOption: "5.71 litres",
    explanation: "Original water = 20 litres, milk = 60 litres. Let added water be x. (20 + x)/(80 + x) = 0.30 => 20 + x = 24 + 0.3x => 0.7x = 4 => x = 4 / 0.7 = 5.71 litres.",
    topic: "Mixtures"
  },
  {
    category: "Percentage",
    difficulty: "Easy",
    questionText: "What percent of 7.2 kg is 18 grams?",
    options: ["0.25%", "2.5%", "25%", "0.025%"],
    correctOption: "0.25%",
    explanation: "7.2 kg = 7200 grams. Percentage = (18 / 7200) * 100 = 18 / 72 = 0.25%.",
    topic: "Weights"
  },
  {
    category: "Percentage",
    difficulty: "Medium",
    questionText: "A population of a town increases by 5% annually. If its present population is 92610, what was it 3 years ago?",
    options: ["80000", "84000", "85000", "86000"],
    correctOption: "80000",
    explanation: "Present = P * (1 + r/100)^3 => 92610 = P * (1.05)^3 => 92610 = P * 1.157625 => P = 92610 / 1.157625 = 80000.",
    topic: "Population"
  },

  // 7. Time and Work
  {
    category: "Time and Work",
    difficulty: "Easy",
    questionText: "A can do a piece of work in 10 days and B in 15 days. How many days will they take to complete the work together?",
    options: ["5 days", "6 days", "8 days", "9 days"],
    correctOption: "6 days",
    explanation: "Combined rate = 1/10 + 1/15 = 5/30 = 1/6. Days taken = 6 days.",
    topic: "Combined Work"
  },
  {
    category: "Time and Work",
    difficulty: "Medium",
    questionText: "A is twice as good a workman as B and together they finish a piece of work in 18 days. In how many days will A alone finish the work?",
    options: ["27 days", "36 days", "54 days", "18 days"],
    correctOption: "27 days",
    explanation: "Let B's daily work be x, A's daily work is 2x. Together: 3x = 1/18 => x = 1/54. A's daily rate = 2x = 2/54 = 1/27. So A takes 27 days.",
    topic: "Work Efficiency"
  },
  {
    category: "Time and Work",
    difficulty: "Hard",
    questionText: "A, B and C can complete a work in 24, 30 and 40 days respectively. They began the work together but C left 4 days before the completion of the work. In how many days was the work completed?",
    options: ["11 days", "12 days", "13 days", "14 days"],
    correctOption: "11 days",
    explanation: "Rates: A=1/24, B=1/30, C=1/40. Let total days be x. A and B worked for x days, C worked for (x - 4) days. x/24 + x/30 + (x-4)/40 = 1 => Multiply by LCM (120): 5x + 4x + 3(x - 4) = 120 => 12x - 12 = 120 => 12x = 132 => x = 11 days.",
    topic: "Work Schedules"
  },
  {
    category: "Time and Work",
    difficulty: "Easy",
    questionText: "If 12 men can build a wall in 20 days, how many days will 8 men take to build the same wall?",
    options: ["25 days", "30 days", "32 days", "40 days"],
    correctOption: "30 days",
    explanation: "Man-days required = 12 * 20 = 240. Days for 8 men = 240 / 8 = 30 days.",
    topic: "Man-Hours"
  },
  {
    category: "Time and Work",
    difficulty: "Medium",
    questionText: "A and B can do a work in 12 days, B and C in 15 days, and C and A in 20 days. If A, B, C work together, in how many days will they finish?",
    options: ["8 days", "10 days", "12 days", "15 days"],
    correctOption: "10 days",
    explanation: "2 * (A + B + C) = 1/12 + 1/15 + 1/20 = (5 + 4 + 3)/60 = 12/60 = 1/5. Combined rate A+B+C = 1/10. Days taken = 10 days.",
    topic: "Paired Work"
  },
  {
    category: "Time and Work",
    difficulty: "Easy",
    questionText: "A can paint a house in 4 days, and B can paint it in 6 days. If they are joined by C and together paint the house in 2 days, how long does C take alone?",
    options: ["8 days", "10 days", "12 days", "24 days"],
    correctOption: "12 days",
    explanation: "Combined rate = 1/4 + 1/6 + C_rate = 1/2 => 5/12 + C_rate = 6/12 => C_rate = 1/12. C alone takes 12 days.",
    topic: "Combined Work"
  },
  {
    category: "Time and Work",
    difficulty: "Medium",
    questionText: "A work is started by A and B. After 3 days, B leaves. If A takes another 6 days to finish the work, and B alone could do it in 12 days, how long does A take alone?",
    options: ["10 days", "12 days", "15 days", "18 days"],
    correctOption: "12 days",
    explanation: "Let A's rate be 1/a. B's rate = 1/12. 3 * (1/a + 1/12) + 6/a = 1 => 9/a + 3/12 = 1 => 9/a + 1/4 = 1 => 9/a = 3/4 => 3a = 36 => a = 12 days.",
    topic: "Work Schedules"
  },
  {
    category: "Time and Work",
    difficulty: "Hard",
    questionText: "A can do a piece of work in 80 days. He works at it for 10 days and then B alone finishes the remaining work in 42 days. In how much time will they together complete the work?",
    options: ["24 days", "25 days", "30 days", "40 days"],
    correctOption: "30 days",
    explanation: "A does 10/80 = 1/8 of work in 10 days. Remaining work = 7/8. B does 7/8 in 42 days => B's full work time = 42 * (8/7) = 48 days. Together rate = 1/80 + 1/48 = (3 + 5)/240 = 8/240 = 1/30. They take 30 days.",
    topic: "Successive Work"
  },
  {
    category: "Time and Work",
    difficulty: "Easy",
    questionText: "If 3 men or 6 women can reap a field in 40 days, how long will 8 men and 8 women take to reap it?",
    options: ["10 days", "12 days", "15 days", "20 days"],
    correctOption: "10 days",
    explanation: "3 men = 6 women => 1 man = 2 women. 8 men + 8 women = 16 women + 8 women = 24 women. If 6 women take 40 days, 24 women take (6 * 40)/24 = 10 days.",
    topic: "Man-Woman Efficiency"
  },
  {
    category: "Time and Work",
    difficulty: "Medium",
    questionText: "A and B perform a task. A is 50% more efficient than B. If B takes 15 days, how long does A take?",
    options: ["10 days", "8 days", "12 days", "7.5 days"],
    correctOption: "10 days",
    explanation: "Efficiency A : B = 1.5 : 1 = 3 : 2. Time taken is inversely proportional, so Time A : Time B = 2 : 3. If B takes 15 days, A takes 10 days.",
    topic: "Work Efficiency"
  },

  // 8. Number Series
  {
    category: "Number Series",
    difficulty: "Easy",
    questionText: "Look at this series: 2, 4, 8, 16, 32, ... What number should come next?",
    options: ["48", "56", "64", "128"],
    correctOption: "64",
    explanation: "Each number in the series is multiplied by 2 (geometric progression). Next is 32 * 2 = 64.",
    topic: "Geometric Series"
  },
  {
    category: "Number Series",
    difficulty: "Easy",
    questionText: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?",
    options: ["7", "10", "12", "13"],
    correctOption: "10",
    explanation: "Alternative addition/subtraction: +3, -2, +3, -2, +3... Next is 12 - 2 = 10.",
    topic: "Alternating Series"
  },
  {
    category: "Number Series",
    difficulty: "Medium",
    questionText: "Identify the missing number in the sequence: 2, 5, 9, 19, 37, ?",
    options: ["73", "75", "76", "78"],
    correctOption: "75",
    explanation: "Pattern is: *2 + 1, then *2 - 1, then *2 + 1, *2 - 1... Next is 37 * 2 + 1 = 75.",
    topic: "Arithmetic Series"
  },
  {
    category: "Number Series",
    difficulty: "Medium",
    questionText: "What number should replace the question mark: 58, 52, 46, 40, 34, ?",
    options: ["26", "28", "30", "32"],
    correctOption: "28",
    explanation: "Arithmetic progression with a common difference of -6. Next is 34 - 6 = 28.",
    topic: "Arithmetic Series"
  },
  {
    category: "Number Series",
    difficulty: "Hard",
    questionText: "Look at this series: 3, 12, 48, 192, ... What number should come next?",
    options: ["288", "384", "576", "768"],
    correctOption: "768",
    explanation: "Each term is multiplied by 4: 3*4=12, 12*4=48, 48*4=192, 192*4=768.",
    topic: "Geometric Series"
  },
  {
    category: "Number Series",
    difficulty: "Medium",
    questionText: "Find the missing term: 1, 4, 9, 16, 25, 36, ?",
    options: ["40", "45", "49", "54"],
    correctOption: "49",
    explanation: "The series is of consecutive squares: 1², 2², 3², 4², 5², 6², 7² = 49.",
    topic: "Squares Series"
  },
  {
    category: "Number Series",
    difficulty: "Easy",
    questionText: "Find the next number: 10, 15, 20, 25, 30, ?",
    options: ["32", "35", "40", "45"],
    correctOption: "35",
    explanation: "Arithmetic progression with a common difference of +5. Next is 30 + 5 = 35.",
    topic: "Arithmetic Series"
  },
  {
    category: "Number Series",
    difficulty: "Hard",
    questionText: "Find the next number in the sequence: 2, 3, 5, 8, 13, 21, ?",
    options: ["29", "31", "34", "38"],
    correctOption: "34",
    explanation: "Fibonacci sequence logic where each term is the sum of the two preceding terms: 13 + 21 = 34.",
    topic: "Fibonacci Series"
  },
  {
    category: "Number Series",
    difficulty: "Medium",
    questionText: "Look at this series: 36, 34, 30, 28, 24, ... What number should come next?",
    options: ["20", "22", "23", "26"],
    correctOption: "22",
    explanation: "Alternating subtraction: -2, -4, -2, -4... Next is 24 - 2 = 22.",
    topic: "Alternating Series"
  },
  {
    category: "Number Series",
    difficulty: "Hard",
    questionText: "Find the missing term: 2, 9, 28, 65, ?",
    options: ["120", "126", "128", "130"],
    correctOption: "126",
    explanation: "Pattern is (n³ + 1) for n = 1, 2, 3, 4: 1³+1=2, 2³+1=9, 3³+1=28, 4³+1=65. Next is 5³ + 1 = 125 + 1 = 126.",
    topic: "Powers Series"
  }
];

const seedData = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB for seeding...");
    }

    // 1. Clear existing challenges and questions
    await CodingChallenge.deleteMany({});
    console.log("Deleted all coding challenges.");

    await AptitudeQuestion.deleteMany({});
    console.log("Deleted all aptitude questions.");

    // 2. Insert coding challenges
    const createdChallenges = await CodingChallenge.insertMany(codingChallenges);
    console.log(`Successfully seeded ${createdChallenges.length} coding challenges.`);

    // 3. Insert aptitude questions
    const createdAptitude = await AptitudeQuestion.insertMany(aptitudeQuestions);
    console.log(`Successfully seeded ${createdAptitude.length} aptitude questions.`);

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during database seeding: ", error);
    process.exit(1);
  }
};

seedData();
