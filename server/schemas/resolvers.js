const { User, Book } = require('../models');
const { AuthenthicationError } = require('apollo-server-express');
const { signToken } = require('../routes');

const resolvers = {
    Query: {
        me: async (parents, args, context) => {

            if(context.user) {
                const userData = await User.findOne({})
                .select('-__v -password')
                .populate('books')

                return userData;
            }

            throw new AuthenthicationError('Please login!')
        },
    },
    Mutation: {
        
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return {token, user};
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenthicationError('credentials are not valid');
            }
            const correctPassword = await user.isCorrectPassword(password);

            if(!correctPassword) {
                throw new AuthenthicationError('credntials are not valid');
            }
            const token = signToken(user);
            return {token,user};
        },

        saveBook: async (parent, args, context) => {
            if (context.user) {

                const UpdateUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    { $addToSet: { savedBooks: args.input }},
                    {new: true}
                );
                return UpdateUser;
            }

            throw new AuthenthicationError('Please login!');
        },

        removeBook: async (parent, args, context) => {
            if(context.user) {
                const UpdateUser = await User.findOneAndUpdate(
                    {_id: context.user._id },
                    { $pull: { savedBooks: {bookId: args.bookId } }},
                    {new: true}  
                );
                return UpdateUser;     
        }
        throw new AuthenthicationError('Please login!');
        }}
};

module.exports = resolvers;