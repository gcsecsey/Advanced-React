import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import fetch from 'isomorphic-fetch';
import Form from './styles/Form';
import Error from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
	mutation CREATE_ITEM_MUTATION(
		$title: String!
		$description: String!
		$image: String
		$largeImage: String
		$price: Int!
	) {
		createItem(
			title: $title
			description: $description
			image: $image
			largeImage: $largeImage
			price: $price
		) {
			id
		}
	}
`;

class CreateItem extends Component {
	state = {
		title: 'Doggo',
		description: 'Very good boi',
		image: '',
		largeImage: '',
		price: 9000,
	};

	handleChange = e => {
		const { name, type, value } = e.target;
		const val = type === 'number' ? parseFloat(value) : value;
		this.setState({ [name]: val });
	};

	uploadFile = async e => {
		console.log('uploading file...');
		const { files } = e.target;
		const data = new FormData();
		data.append('file', files[0]);
		data.append('upload_preset', 'sickfits');

		const res = await fetch(
			'https://api.cloudinary.com/v1_1/gcsecsey/image/upload',
			{
				method: 'POST',
				body: data,
			}
		);

		const file = await res.json();
		console.log({ file });
		this.setState({
			image: file.secure_url,
			largeImage: file.eager[0].secure_url,
		});
	};

	render() {
		const { title, image, price, description } = this.state;
		return (
			<Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
				{(createItem, { loading, error }) => (
					<Form
						onSubmit={async e => {
							// Stop the form from submitting
							e.preventDefault();
							// call the mutation
							const res = await createItem();
							// change to single item page
							console.log(res);
							Router.push({
								pathname: '/item',
								query: { id: res.data.createItem.id },
							});
						}}
					>
						<Error error={error} />
						<fieldset disabled={loading} aria-busy={loading}>
							<label htmlFor='file'>
								Image
								<input
									type='file'
									id='file'
									name='file'
									placeholder='Upload an image'
									required
									onChange={this.uploadFile}
								/>
								{image && <img src={image} width='200' alt='product' />}
							</label>
							<label htmlFor='title'>
								Title
								<input
									type='text'
									id='title'
									name='title'
									placeholder='Title'
									required
									value={title}
									onChange={this.handleChange}
								/>
							</label>
							<label htmlFor='price'>
								Price
								<input
									type='text'
									id='price'
									name='price'
									placeholder='Price'
									required
									value={price}
									onChange={this.handleChange}
								/>
							</label>
							<label htmlFor='description'>
								Description
								<textarea
									id='description'
									name='description'
									placeholder='Enter description'
									required
									value={description}
									onChange={this.handleChange}
								/>
							</label>
							<button type='submit'>Submit</button>
						</fieldset>
					</Form>
				)}
			</Mutation>
		);
	}
}

export default CreateItem;

export { CREATE_ITEM_MUTATION };
