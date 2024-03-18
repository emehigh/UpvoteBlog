import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardMedia, CardContent, CardActions, Avatar, IconButton, Typography, Box } from '@mui/material';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import axios from 'axios';
import { toast } from 'react-toastify';

const PostCard = ({
    id,
    title,
    subheader,
    image,
    content,
    comments,
    upVotes,
    showPosts,
    likesId
}) => {
    const { userInfo } = useSelector(state => state.signIn);

    // Check if likesId is defined before using it
    const isLiked = likesId && likesId.includes(userInfo && userInfo.id);

    // Function to handle adding upvote
    const addUpvote = async () => {
        try {
            const { data } = await axios.put(`/api/addupvote/post/${id}`);
            // showPosts();
        } catch (error) {
            console.log(error.response.data.error);
            toast.error(error.response.data.error);
        }
    };

    // Function to handle removing upvote
    const removeLike = async () => {
        try {
            const { data } = await axios.put(`/api/removelike/post/${id}`);
            // showPosts();
        } catch (error) {
            console.log(error.response.data.error);
            toast.error(error.response.data.error);
        }
    };

    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                        R
                    </Avatar>
                }
                title={title}
                subheader={subheader}
            />
            <Link to={`/post/${id}`}>
                <CardMedia
                    component="img"
                    height="194"
                    image={image}
                    alt="Paella dish"
                />
            </Link>
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    <Box component='span' dangerouslySetInnerHTML={{ __html: content.split(" ").slice(0, 10).join(" ") + "..." }}></Box>
                </Typography>
            </CardContent>
            <CardActions>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        {
                            isLiked ?
                                <IconButton onClick={removeLike} aria-label="remove upvote">
                                    <FavoriteIcon sx={{ color: 'red' }} />
                                </IconButton>
                                :
                                <IconButton onClick={addUpvote} aria-label="add upvote">
                                    <FavoriteBorderIcon sx={{ color: 'red' }} />
                                </IconButton>
                        }
                        {upVotes} Upvote(s)
                    </Box>
                    <Box>
                        {comments}
                        <IconButton aria-label="comment">
                            <CommentIcon />
                        </IconButton>
                    </Box>
                </Box>
            </CardActions>
        </Card>
    );
};

export default PostCard;
