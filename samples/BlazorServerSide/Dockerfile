#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["samples/BlazorServerSide/BlazorServerSide.csproj", "samples/BlazorServerSide/"]
COPY ["src/Penman.Blazor.Quill/Penman.Blazor.Quill.csproj", "src/Penman.Blazor.Quill/"]
RUN dotnet restore "samples/BlazorServerSide/BlazorServerSide.csproj"
COPY . .
WORKDIR "/src/samples/BlazorServerSide"
RUN dotnet build "BlazorServerSide.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BlazorServerSide.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BlazorServerSide.dll"]