FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime

WORKDIR /target
## default environment should be Development, can pass Staging or Production as argument when building the image
## ex: docker build --build-arg ASPNETCORE_ENVIRONMENT=Staging
ARG ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_ENVIRONMENT=$ASPNETCORE_ENVIRONMENT
## google cloud run containers must run on port 8080
## ex: docker build --build-arg ASPNETCORE_PORT=443
ARG ASPNETCORE_PORT=8080
ENV ASPNETCORE_URLS=http://*:$ASPNETCORE_PORT
EXPOSE $ASPNETCORE_PORT

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS compile

WORKDIR /source
## there are issues with dotnet restore, until fixed, we will forgo layer caching and
## just restore dependencies when building the image
COPY . .

WORKDIR "/source/src/Kiira.Platform.Worker.Api"
## build
RUN dotnet build "Kiira.Platform.Worker.Api.csproj" --configuration Release --nologo --no-cache
#RUN dotnet test "Kiira.Platform.Worker.Api.csproj" --configuration Release --no-build --nologo

FROM compile as publish
## publish api to output directory
RUN dotnet publish "Kiira.Platform.Worker.Api.csproj" --configuration Release --no-build --nologo --output /target/publish

FROM runtime as release
WORKDIR /target
COPY --from=publish /target/publish .
ENTRYPOINT ["dotnet", "Kiira.Platform.Worker.Api.dll"]