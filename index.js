import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

// Load stored data from Local Storage, if any
if (localStorage.getItem('tweetsData')) {
  tweetsData.splice(0, tweetsData.length, ...JSON.parse(localStorage.getItem('tweetsData')));
}

render()


// Add event listeners to the tweet button and reply button
// and delete button
document.addEventListener('click', function(e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like)
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet)
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply)
  } else if (e.target.id === 'tweet-btn') {
    handleTweetBtnClick()
  } else if (e.target.id === 'tweet-reply-btn') {
    handleTweetReplyBtnClick(
      e.target.parentElement.firstElementChild.value,
      e.target.dataset.comment
    )
  } else if (e.target.id === 'delete-btn') {
    handleDeleteTweetButton(e.target.dataset.deleteTweet)
  } else if (e.target.id === 'delete-comment') {
    handleDeleteCommentButton(e.target.dataset.deleteComment)
  }
})

function handleDeleteCommentButton(commentId) {
  

  // Find the tweet that contains the reply with the matching uuid
  const tweetObject = tweetsData.filter(function(tweet) {
    return tweet.replies.some(function(reply) {
      return reply.uuid === commentId
    })
  })

  // Ensure a tweet was found
  if (tweetObject.length === 0) return

  // Find the index of the reply within that tweet's replies array
  const replyIndex = tweetObject[0].replies.findIndex(function(reply) {
    return reply.uuid === commentId
  })

  if (replyIndex !== -1) {
    // Remove the reply from the tweet's replies array
    tweetObject[0].replies.splice(replyIndex, 1)
  }

  render() // Re-render the tweets after deletion
}

function handleDeleteTweetButton(tweetId) {
  // Find the index of the tweet to be deleted in the tweetsData array
  const tweetIndex = tweetsData.findIndex(function(tweet) {
    return tweet.uuid === tweetId
  })

  if (tweetIndex !== -1) {
    // Remove the tweet from the tweetsData array
    tweetsData.splice(tweetIndex, 1)
  }

  render() // Re-render the tweets after deletion
}

function handleTweetReplyBtnClick(reply, tweetId) {
  const targetTweetObj = tweetsData.find(function(tweet) {
    return tweet.uuid === tweetId
  })

  if (reply) {
    targetTweetObj.replies.unshift({
      handle: `@Scrimba`,
      canDelete: true,
      uuid: uuidv4(),
      profilePic: `images/scrimbalogo.png`,
      tweetText: reply
    })
    // Ensure this tweet's reply container is visible after adding a reply
    targetTweetObj.isReplyVisible = true
  }
  render()
}

function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.find(function(tweet) {
    return tweet.uuid === tweetId
  })

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--
  } else {
    targetTweetObj.likes++
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked
  render()
}

function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.find(function(tweet) {
    return tweet.uuid === tweetId
  })

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--
  } else {
    targetTweetObj.retweets++
  }
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
  render()
}

function handleReplyClick(tweetId) {
  // Toggle the visibility of the reply container for this tweet
  const tweetObj = tweetsData.find(tweet => tweet.uuid === tweetId)
  tweetObj.isReplyVisible = !tweetObj.isReplyVisible
  render()
}

function handleTweetBtnClick() {
  const tweetInput = document.getElementById('tweet-input')
  if (tweetInput.value) {
    tweetsData.unshift({
      handle: `@Scrimba`,
      canDelete: true,
      profilePic: `images/scrimbalogo.png`,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
      isReplyVisible: false // Initially, hide the reply container
    })
    render()
    tweetInput.value = ''
  }
}

function getFeedHtml() {
  let feedHtml = ``
  
  tweetsData.forEach(function(tweet) {
    let likeIconClass = tweet.isLiked ? 'liked' : ''
    let retweetIconClass = tweet.isRetweeted ? 'retweeted' : ''
    let repliesHtml = ``

    if (tweet.replies.length > 0) {
      tweet.replies.forEach(function(reply) {
        repliesHtml += `
<div class="tweet-reply">
  <div class="tweet-inner">
    <img src="${reply.profilePic}" class="profile-pic">
    <div>
      <p class="handle">${reply.handle}</p>
      <p class="tweet-text">${reply.tweetText}</p>
    </div>
  </div>
  <div class="${ reply.canDelete ? '' : 'hidden'}" id='torightupperofreplyBtn'>
    <button class="delete-btn"
            id="delete-comment"
            data-delete-comment="${reply.uuid}">x</button>
  </div>
</div>
`
      })
    }

    // Use tweet.canDelete for tweet delete button visibility (or adjust as needed)
    const deleteTweetBtnClass = tweet.canDelete ? '' : 'hidden'

    feedHtml += `
<div class="tweet">
  <div class="tweet-inner">
    <img src="${tweet.profilePic}" class="profile-pic">
    <div>
      <p class="handle">${tweet.handle}</p>
      <p class="tweet-text">${tweet.tweetText}</p>
      <div class="tweet-details">
        <span class="tweet-detail">
          <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
          ${tweet.replies.length}
        </span>
        <span class="tweet-detail">
          <i class="fa-solid fa-heart ${likeIconClass}" data-like="${tweet.uuid}"></i>
          ${tweet.likes}
        </span>
        <span class="tweet-detail">
          <i class="fa-solid fa-retweet ${retweetIconClass}" data-retweet="${tweet.uuid}"></i>
          ${tweet.retweets}
        </span>
        <div class="${deleteTweetBtnClass}" id='torightupper'>
          <button class="delete-btn"
                  id="delete-btn"
                  data-delete-tweet="${tweet.uuid}">x</button>
        </div>
      </div>
    </div>
  </div>
  <div class="${ tweet.isReplyVisible ? '' : 'hidden' }" id="replies-${tweet.uuid}">
    <div id="tweet-reply">
      <textarea class="tweet-reply-input" placeholder="Tweet your reply"></textarea>
      <button class="tweet-btn" id="tweet-reply-btn" data-comment="${tweet.uuid}">Comment</button>
    </div>
    ${repliesHtml}
  </div>
</div>
`
  })
  return feedHtml
}

function render() {
  localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
  document.getElementById('feed').innerHTML = getFeedHtml()
}
