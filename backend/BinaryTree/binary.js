// class Node {
//   constructor(data) {
//     this.data = data;
//     this.left = null;
//     this.right = null;
//   }

//   findNodeById(node, id) {
//     if (node === null) {
//       return null;
//     }

//     if (node.data.id === id) {
//       return node;
//     }

//     const leftResult = this.findNodeById(node.left, id);
//     if (leftResult !== null) {
//       return leftResult;
//     }

//     return this.findNodeById(node.right, id);
//   }

//   insert(data_arr) {
//     this.root = this.insertNode(this, data_arr, 0);
//   }

//   insertNode(root, arr, index) {
//     if (index >= arr.length) {
//       return null;
//     }
//     root = new Node(arr[index]);
//     root.left = this.insertNode(root.left, arr, 2 * index + 1);
//     root.right = this.insertNode(root.right, arr, 2 * index + 2);

//     return root;
//   }

//   countActiveNodes(node) {
//     if (node === null) {
//       return 0;
//     }
//     // Check if the node's status is "active"
//     if (node.data.status === "active") {
//       return 1 + this.countActiveNodes(node.left) + this.countActiveNodes(node.right);
//     } else {
//       // If the status is not "active," skip this node but continue counting its children
//       return this.countActiveNodes(node.left) + this.countActiveNodes(node.right);
//     }
//   }

//   countLeftRightActiveNodesById(id) {
//     const targetNode = this.findNodeById(this.root, id);

//     if (targetNode === null) {
//       console.log("Node not found.");
//       return null;
//     }

//     const leftCount = this.countActiveNodes(targetNode.left);
//     const rightCount = this.countActiveNodes(targetNode.right);

//     return { leftCount, rightCount };
//   }

//   countNodes(node) {
//     if (node === null) {
//       return 0;
//     }
//     return 1 + this.countNodes(node.left) + this.countNodes(node.right);
//   }

//   //count left and right users
//   countLeftAndRightNodesById(id) {
//     const targetNode = this.findNodeById(this.root, id);

//     if (targetNode === null) {
//       console.log("Node not found.");
//       return null;
//     }

//     const leftCount = this.countNodes(targetNode.left);
//     const rightCount = this.countNodes(targetNode.right);

//     return { leftCount, rightCount };
//   }

//   inOrder() {
//     this.inOrderTraversal(this.root);
//   }

//   inOrderTraversal(node) {
//     if (node !== null) {
//       this.inOrderTraversal(node.left);
//       console.log(node.data);
//       this.inOrderTraversal(node.right);
//     }
//   }
// }

// module.exports = Node;

class Node {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }

  findNodeByReferId(node, id) {
    if (!node) return null;
    if (node.data.referId === id) return node;

    const leftResult = this.findNodeByReferId(node.left, id);
    if (leftResult) return leftResult;

    return this.findNodeByReferId(node.right, id);
  }

  findNodeById(node, id) {
    if (node === null) {
      return null;
    }

    if (node.data.id === id) {
      return node;
    }

    const leftResult = this.findNodeById(node.left, id);
    if (leftResult !== null) {
      return leftResult;
    }

    return this.findNodeById(node.right, id);
  }

  countLeftAndRightNodesById(id) {
    console.log(id);
    const targetNode = this.findNodeById(this.root, id);
    console.log(targetNode);

    if (targetNode === null) {
      console.log("Node not found.");
      return null;
    }

    const leftCount = this.countNodes(targetNode.left);
    const rightCount = this.countNodes(targetNode.right);

    return { leftCount, rightCount };
  }
  countNodes(node) {
    if (node === null) {
      return 0;
    }
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }
  countLeftRightActiveNodesById(id) {
    const targetNode = this.findNodeById(this.root, id);

    if (targetNode === null) {
      console.log("Node not found.");
      return null;
    }

    const leftCount = this.countActiveNodes(targetNode.left);
    const rightCount = this.countActiveNodes(targetNode.right);

    return { leftCount, rightCount };
  }
  countActiveNodes(node) {
    if (node === null) {
      return 0;
    }
    // Check if the node's status is "active"
    // if (node.data.status === "active") {
      return (
        1 + this.countActiveNodes(node.left) + this.countActiveNodes(node.right)
      );
    // } else {
    //   // If the status is not "active," skip this node but continue counting its children
    //   return (
    //     this.countActiveNodes(node.left) + this.countActiveNodes(node.right)
    //   );
    // }
  }
  insertInSubtree(parentNode, newNode) {
    if (!parentNode.left) {
      parentNode.left = new Node(newNode);
      return true;
    }
    if (!parentNode.right) {
      parentNode.right = new Node(newNode);
      return true;
    }

    const queue = [parentNode.left, parentNode.right];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current.left) {
        current.left = new Node(newNode);
        return true;
      }
      if (!current.right) {
        current.right = new Node(newNode);
        return true;
      }
      queue.push(current.left);
      queue.push(current.right);
    }
    return false;
  }

  addInSubtreeBFS(node, childData) {
    if (!node) {
      return false;
    }

    const queue = [node]; // Initialize the queue with the root of the subtree

    while (queue.length > 0) {
      const current = queue.shift(); // Dequeue the first node

      // Check for an available left child spot
      if (!current.left) {
        current.left = new Node(childData);
        return true;
      }

      // Check for an available right child spot
      if (!current.right) {
        current.right = new Node(childData);
        return true;
      }

      // Add children to the queue for further traversal
      queue.push(current.left);
      queue.push(current.right);
    }

    return false; // If no available spot was found
  }

  insertUnderReferId(childData) {
    if (childData.referby) {
    }
    const parentId = childData.referby; // Use referBy to find the parent
    const parentNode = this.findNodeByReferId(this.root, parentId);

    if (!parentNode) {
      console.log("Parent node not found.");
      return;
    }

    if (!this.addInSubtreeBFS(parentNode, childData)) {
      console.log("No available spot in the subtree to add the child.");
    }
  }

  visualizeTree(node, prefix = "", isLeft = true) {
    if (node) {
      console.log(prefix + (isLeft ? "├── " : "└── ") + node.data.name);
      this.visualizeTree(node.left, prefix + (isLeft ? "│   " : "    "), true);
      this.visualizeTree(
        node.right,
        prefix + (isLeft ? "│   " : "    "),
        false
      );
    }
  }

  insert(data_arr) {
    this.root = this.insertNode(this, data_arr, 0);
  }

  insertNode(root, arr, index) {
    if (index >= arr.length) {
      return null;
    }
    root = new Node(arr[index]);
    root.left = this.insertNode(root.left, arr, 2 * index + 1);
    root.right = this.insertNode(root.right, arr, 2 * index + 2);
    return root;
  }
  inOrder() {
    this.inOrderTraversal(this.root);
  }

  inOrderTraversal(node) {
    if (node !== null) {
      this.inOrderTraversal(node.left);
      console.log(node.data);
      this.inOrderTraversal(node.right);
    }
  }
}

// const tree = new Node();
// let d = [sampleData[1]];
// tree.insert(d);
// // tree.insertUnderReferId(sampleData[1]);
// tree.insertUnderReferId(sampleData[2]);
// tree.insertUnderReferId(sampleData[3]);
// tree.insertUnderReferId(sampleData[4]);
// tree.insertUnderReferId(sampleData[5]);
// tree.insertUnderReferId(sampleData[6]);
// tree.insertUnderReferId(sampleData[7]);
// tree.insertUnderReferId(sampleData[8]);
// tree.insertUnderReferId(sampleData[9]);
// tree.insertUnderReferId(sampleData[10]);
// tree.insertUnderReferId(sampleData[11]);
// tree.insertUnderReferId(sampleData[12]);
// tree.insertUnderReferId(sampleData[13]);
// tree.insertUnderReferId(sampleData[14]);
// tree.insertUnderReferId(sampleData[15]);
// tree.insertUnderReferId(sampleData[16]);
// tree.insertUnderReferId(sampleData[17]);
// tree.insertUnderReferId(sampleData[18]);
// tree.insertUnderReferId(sampleData[19]);
// tree.insertUnderReferId(sampleData[20]);
// tree.insertUnderReferId(sampleData[21]);
// tree.insertUnderReferId(sampleData[22]);
// tree.insertUnderReferId(sampleData[23]);
// tree.insertUnderReferId(sampleData[24]);
// tree.insertUnderReferId(sampleData[25]);
// tree.insertUnderReferId(sampleData[26]);
// tree.insertUnderReferId(sampleData[27]);
// tree.insertUnderReferId(sampleData[28]);
// tree.insertUnderReferId(sampleData[29]);

// let view = tree.inOrder();
// console.log(view);
// // for (let i = 1; i < sampleData.length - 1; i++) {
// //   tree.insertUnderReferId(sampleData[i]);
// // }

// console.log("Visualized Tree Structure:");
// tree.visualizeTree(tree.root);

module.exports = Node;
