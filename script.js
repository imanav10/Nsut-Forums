let forumPosts = [];
let isLoggedIn = false;

function addPost(event) {
  event.preventDefault();
  const postContent = document.getElementById('postContent').value;
  const imageFile = document.getElementById('imageUpload').files[0];
  let imageSrc = null;

  // Prompt the user for their username
  const username = prompt('Please enter your username:');
  
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageSrc = e.target.result;
      const post = {
        content: postContent,
        image: imageSrc,
        upvotes: 0,
        downvotes: 0,
        username: username
      };
      forumPosts.push(post);
      displayPosts();
      saveForumPosts();
    };
    reader.readAsDataURL(imageFile);
  } else {
    const post = {
      content: postContent,
      image: null,
      upvotes: 0,
      downvotes: 0,
      username: username
    };
    forumPosts.push(post);
    displayPosts();
    saveForumPosts();
  }

  document.getElementById('forumForm').reset();
}
  
  function upvote(index) {
    if (!forumPosts[index].upvoted) {
      forumPosts[index].upvoted = true;
      forumPosts[index].downvoted = false;
      forumPosts[index].upvotes++;
      forumPosts[index].downvotes = Math.max(0, forumPosts[index].downvotes - 1);
      displayPosts();
      saveForumPosts();
    }
  }
  
  function downvote(index) {
    if (!forumPosts[index].downvoted) {
      forumPosts[index].downvoted = true;
      forumPosts[index].upvoted = false;
      forumPosts[index].downvotes++;
      forumPosts[index].upvotes = Math.max(0, forumPosts[index].upvotes - 1);
      displayPosts();
      saveForumPosts();
    }
  }
  
  function saveAsFlashcard(index) {
    const post = forumPosts[index];
  
    const flashcardContent = `
      Posted by: ${post.username || 'Unknown User'}
      Post Content:
      ${post.content}
  
      Upvotes: ${post.upvotes}
      Downvotes: ${post.downvotes}
    `;
  
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    // Adjust canvas dimensions based on content length and image
    // (rest of the code remains unchanged)
  
    // Load the image and draw it on the canvas
    if (post.image) {
      const image = new Image();
      image.crossOrigin = 'anonymous';  // Allow cross-origin image download
      image.src = post.image;
  
      image.onload = function () {
        // Draw the image at the appropriate position
        context.drawImage(image, 20, textHeight + 40);
      const imageAspectRatio = image.width / image.height;
      const imageHeight = canvasWidth / imageAspectRatio;

      canvasHeight += imageHeight;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = '16px Arial';
      context.fillStyle = '#000';
      wrapText(context, flashcardContent, 20, 40, canvasWidth - 40, 20);

      // Draw the image
      context.drawImage(image, 20, textHeight + 40);
      downloadFlashcard(canvas);
    };
  } else {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '16px Arial';
    context.fillStyle = '#000';
    wrapText(context, flashcardContent, 20, 40, canvasWidth - 40, 20);

    downloadFlashcard(canvas);
  }
}

function calculateTextHeight(context, text, maxWidth) {
  let lineHeight = 20; 
  let y = 0;
  let lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let metrics = context.measureText(line);
    let testWidth = metrics.width;
    let wrappedText = '';

    if (testWidth <= maxWidth) {
      y += lineHeight;
      wrappedText = line;
    } else {
      let words = line.split(' ');
      let line = '';

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let testWidth = context.measureText(testLine).width;

        if (testWidth > maxWidth && n > 0) {
          y += lineHeight;
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }

      wrappedText = line;
      y += lineHeight;
    }
  }

  return y;
}

function downloadFlashcard(canvas) {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'flashcard.png';

  // Simulate a click event on the link to start the download
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  link.dispatchEvent(event);
}





function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

function displayPosts() {
  const postList = document.getElementById('postList');
  postList.innerHTML = '';

  forumPosts.forEach((post, index) => {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    postDiv.innerHTML = `
      <p><strong>Posted by ${post.username || 'Unknown User'}:</strong> ${post.content}</p>
      ${post.image ? `<img src="${post.image}" alt="Post Image">` : ''}
      <div class="votes">
        <button onclick="upvote(${index})">Upvote (${post.upvotes})</button>
        <button onclick="downvote(${index})">Downvote (${post.downvotes})</button>
        <button onclick="saveAsFlashcard(${index})">Save as Flashcard</button>
        <button onclick="deletePost(${index})">Delete</button>
      </div>
      <div class="comments">
        <input type="text" id="commentInput${index}" placeholder="Your Comment">
        <input type="text" id="usernameInput${index}" placeholder="Your Username">
        <button onclick="addComment(${index})">Add Comment</button>
        <ul>
          ${post.comments ? post.comments.map(comment => `
            <li><strong>${comment.username}${comment.isOP ? ' (OP)' : ''}:</strong> ${comment.content}</li>`).join('') : ''}
        </ul>
      </div>
    `;
    postList.appendChild(postDiv);
  });
}

  
  function deletePost(index) {
    forumPosts.splice(index, 1);
    displayPosts();
    saveForumPosts();
  }
  
  
  function addComment(postIndex) {
    const commentContent = document.getElementById(`commentInput${postIndex}`).value;
    const usernameInput = document.getElementById(`usernameInput${postIndex}`);
    const username = usernameInput ? usernameInput.value : '';
    
    const isOP = username === forumPosts[postIndex].username;
  
    if (commentContent && username) {
      if (!forumPosts[postIndex].comments) {
        forumPosts[postIndex].comments = [];
      }
      // Add the new comment at the end of the comments array
      forumPosts[postIndex].comments.push({ content: commentContent, username: username, isOP: isOP });
      displayPosts();
      saveForumPosts();
    }
  }
   
  
function saveForumPosts() {
  localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
}
 
  

function loadForumPosts() {
  const storedPosts = localStorage.getItem('forumPosts');
  if (storedPosts) {
    forumPosts = JSON.parse(storedPosts);
    displayPosts();
  }
}


// Initial setup
loadForumPosts();

function toggleSearch() {
    const searchContainer = document.querySelector('.search-container');
    searchContainer.classList.toggle('active');
  }
  
  function search() {
    const searchTerm = document.getElementById('searchInput').value;
    // Perform your search logic here
    console.log('Searching for:', searchTerm);
  }
  
  
